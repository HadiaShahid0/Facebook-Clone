import { MessageCircle, Check, X } from "react-feather";
import { supabase } from "../../../../utils/supabase";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../components/layout/navbar";
import {
  getProfileService,
  getBlockedUserIdsService,
} from "../../profile/services/profileServices";
import {
  getChatUsersService,
  getMessageRequestsService,
  getMessageRequestBetweenUsersService,
  getMessagesService,
  sendMessageService,
  acceptMessageRequestService,
  rejectMessageRequestService,
  getUnreadMessageCountsService,
  markMessageNotificationsReadService,
} from "../services/chatServices";
import ChatSidebar from "../components/chatSidebar";
import MessageList from "../components/messageList";
import MessageInput from "../components/messageInput";

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    loadChatData();
  }, []);

  useEffect(() => {
    if (currentUser) loadUnreadMessages();
  }, [currentUser]);

  const loadUnreadMessages = async () => {
    try {
      setUnreadMessages(
        await getUnreadMessageCountsService(currentUser.id)
      );
    } catch (error) {
      console.error("Error loading unread messages:", error);
    }
  };

  const getVisibleChatUsers = async (id) => {
    const blockedIds = await getBlockedUserIdsService(id);
    const [chatUsers, messageRequests] = await Promise.all([
      getChatUsersService(id),
      getMessageRequestsService(id),
    ]);

    return {
      friends: chatUsers.filter(
        (user) => !blockedIds.includes(user.id) && !user.isAdmin
      ),
      requests: messageRequests.filter(
        (item) => !blockedIds.includes(item.sender?.id) && !item.sender?.isAdmin
      ),
    };
  };

  const loadChatData = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setCurrentUser(user);

      const data = await getVisibleChatUsers(user.id);
      setFriends(data.friends);
      setRequests(data.requests);
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    if (!user || user.isAdmin) {
      setSelectedUser(null);
      setMessages([]);
      setRequest(null);
      return;
    }

    try {
      const blockedIds = await getBlockedUserIdsService(currentUser.id);

      if (blockedIds.includes(user.id)) {
        setSelectedUser(null);
        setMessages([]);
        setRequest(null);
        return;
      }

      setSelectedUser(user);
      setLoadingMessages(true);

      const [messagesData, requestData] = await Promise.all([
        getMessagesService(currentUser.id, user.id),
        getMessageRequestBetweenUsersService(currentUser.id, user.id),
      ]);

      setMessages(messagesData);
      setRequest(requestData);

      await markMessageNotificationsReadService(
        currentUser.id,
        user.id
      );

      setUnreadMessages((previous) => {
        const updated = { ...previous };
        delete updated[user.id];
        return updated;
      });
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!userId || !currentUser) return;

    const openUserChat = async () => {
      try {
        const blockedIds = await getBlockedUserIdsService(currentUser.id);

        if (blockedIds.includes(userId)) {
          navigate("/chat");
          return;
        }

        const user =
          friends.find((friend) => friend.id === userId) ||
          requests.find((item) => item.sender?.id === userId)?.sender;

        // Do not open users who are not allowed in chat
        if (!user || user.isAdmin) {
          navigate("/chat");
          return;
        }

        await handleSelectUser(user);
      } catch (error) {
        console.error("Error opening chat:", error);
      }
    };

    openUserChat();
  }, [userId, currentUser, friends, requests]);

  const handleSendMessage = async (text) => {
    try {
      const newMessage = await sendMessageService(
        currentUser.id,
        selectedUser.id,
        text
      );

      setMessages((previous) =>
        previous.some((message) => message.id === newMessage.id)
          ? previous
          : [...previous, newMessage]
      );

      setFriends((previous) =>
        previous.some((friend) => friend.id === selectedUser.id)
          ? previous
          : [...previous, selectedUser]
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error.message);
    }
  };

  const handleAcceptRequest = async () => {
    if (!request) return;

    try {
      setRequestLoading(true);

      const updatedRequest = await acceptMessageRequestService(request.id);
      setRequest(updatedRequest);

      setRequests((previous) =>
        previous.filter((item) => item.id !== request.id)
      );

      setFriends((previous) =>
        previous.some((friend) => friend.id === selectedUser.id)
          ? previous
          : [...previous, selectedUser]
      );
    } catch (error) {
      console.error("Error accepting message request:", error);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!request) return;

    try {
      setRequestLoading(true);
      await rejectMessageRequestService(request.id);

      setRequest({ ...request, status: "rejected" });

      setRequests((previous) =>
        previous.map((item) =>
          item.id === request.id
            ? { ...item, status: "rejected" }
            : item
        )
      );
    } catch (error) {
      console.error("Error rejecting message request:", error);
    } finally {
      setRequestLoading(false);
    }
  };

  // Realtime messages
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const channel = supabase
      .channel(`messages-${currentUser.id}-${selectedUser.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        ({ new: message }) => {
          const isCurrentConversation =
            (message.senderId === currentUser.id &&
              message.receiverId === selectedUser.id) ||
            (message.senderId === selectedUser.id &&
              message.receiverId === currentUser.id);

          if (!isCurrentConversation) return;

          setMessages((previous) =>
            previous.some((item) => item.id === message.id)
              ? previous
              : [...previous, message]
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser, selectedUser]);

  // Realtime message requests
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`message-requests-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messageRequests",
          filter: `receiverId=eq.${currentUser.id}`,
        },
        async () => {
          try {
            const data = await getMessageRequestsService(currentUser.id);
            setRequests(data.filter((item) => !item.sender?.isAdmin));
          } catch (error) {
            console.error("Error updating message requests:", error);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser]);

  // Realtime unread messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`chat-notifications-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          filter: `userId=eq.${currentUser.id}`,
        },
        ({ new: notification }) => {
          if (
            !["message", "messageRequest"].includes(notification.type) ||
            notification.isRead
          )
            return;

          const senderId = notification.senderId;

          if (selectedUser?.id === senderId) {
            markMessageNotificationsReadService(
              currentUser.id,
              senderId
            );
            return;
          }

          setUnreadMessages((previous) => ({
            ...previous,
            [senderId]: (previous[senderId] || 0) + 1,
          }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notification",
          filter: `userId=eq.${currentUser.id}`,
        },
        loadUnreadMessages
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser, selectedUser]);

  const handleUserClick = (id) => navigate(`/profile/${id}`);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div
        className="container-fluid bg-light p-0"
        style={{ height: "calc(100dvh - 56px)", overflow: "hidden" }}
      >
        <div className="row h-100 g-0">
          <div
            className="col-md-4 col-lg-2 bg-white p-0"
            style={{ height: "100%", overflowY: "auto" }}
          >
            <ChatSidebar
              friends={friends}
              requests={requests}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
              onSelectRequest={(item) => handleSelectUser(item.sender)}
              unreadMessages={unreadMessages}
            />
          </div>

          <div
            className="col-md-8 col-lg-10 d-flex flex-column p-0"
            style={{ height: "100%", minHeight: 0 }}
          >
            {!selectedUser ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                <MessageCircle size={50} className="mb-3" />
                <h5>Select a conversation</h5>
                <p>Choose a friend or message request to start chatting.</p>
              </div>
            ) : (
              <>
                <div className="bg-white border-bottom p-3 flex-shrink-0">
                  <div className="d-flex align-items-center">
                    <button
                      className="btn p-0 border-0 bg-transparent"
                      onClick={() => handleUserClick(selectedUser.id)}
                    >
                      {selectedUser.profileImage ? (
                        <img
                          src={selectedUser.profileImage}
                          alt={selectedUser.username}
                          className="rounded-circle"
                          style={{
                            width: 45,
                            height: 45,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                          style={{ width: 45, height: 45 }}
                        >
                          {selectedUser.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>

                    <button
                      className="btn p-0 border-0 bg-transparent text-start ms-3"
                      onClick={() => handleUserClick(selectedUser.id)}
                    >
                      <h6 className="mb-0">{selectedUser.username}</h6>
                      <small className="text-muted">Messenger</small>
                    </button>
                  </div>
                </div>

                <div
                  className="flex-grow-1"
                  style={{ minHeight: 0, overflowY: "auto" }}
                >
                  {loadingMessages ? (
                    <div className="h-100 d-flex justify-content-center align-items-center">
                      <div className="spinner-border" />
                    </div>
                  ) : (
                    <MessageList
                      messages={messages}
                      currentUserId={currentUser.id}
                    />
                  )}
                </div>

                {request?.status === "pending" &&
                  request.receiverId === currentUser.id && (
                    <div className="bg-white border-top p-3 text-center flex-shrink-0">
                      <p className="mb-3">
                        <strong>{selectedUser.username}</strong> sent you a
                        message request.
                      </p>

                      <button
                        className="btn btn-primary me-2"
                        onClick={handleAcceptRequest}
                        disabled={requestLoading}
                      >
                        <Check size={16} className="me-1" />
                        Accept
                      </button>

                      <button
                        className="btn btn-outline-danger"
                        onClick={handleRejectRequest}
                        disabled={requestLoading}
                      >
                        <X size={16} className="me-1" />
                        Reject
                      </button>
                    </div>
                  )}

                {request?.status === "rejected" && (
                  <div className="bg-white border-top p-3 text-center flex-shrink-0">
                    <p className="mb-0 text-danger">
                      Message request rejected.
                    </p>
                  </div>
                )}

                {(!request ||
                  request.status === "accepted" ||
                  (request.status === "pending" &&
                    request.senderId === currentUser.id)) && (
                  <div className="flex-shrink-0">
                    <MessageInput onSend={handleSendMessage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;