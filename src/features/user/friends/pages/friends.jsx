import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../../components/layout/navbar";
import Sidebar from "../../../../components/layout/sidebar";

import FriendRequest from "../components/friendRequest";
import FriendList from "../components/friendList";
import AllUsers from "../components/users";
import SentRequest from "../components/sentRequest";

import { getCurrentUserService } from "../../../auth/services/authServices";
import { subscribeToFriendChanges } from "../services/friendRealtimeService";
import { getBlockedUserIdsService } from "../../profile/services/profileServices";
import { supabase } from "../../../../utils/supabase";

import {
  getFriendRequestsService,
  getFriendsService,
  getSentFriendRequestsService,
  acceptFriendRequestService,
  deleteFriendRequestService,
  getAllUsersService,
} from "../services/friendServices";

const Friends = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const getVisibleUsers = async (userId) => {
    const allUsers = await getAllUsersService(userId);
    const blockedUserIds = await getBlockedUserIdsService(userId);

    return allUsers.filter(
      (user) => !blockedUserIds.includes(user.id) && !user.isAdmin,
    );
  };
  
  const loadFriends = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUserService();

      if (!user) {
        navigate("/login");
        return;
      }

      setCurrentUser(user);

      const [friendRequests, sentFriendRequests, friendList, allUsers] =
        await Promise.all([
          getFriendRequestsService(user.id),
          getSentFriendRequestsService(user.id),
          getFriendsService(user.id),
          getVisibleUsers(user.id),
        ]);

      setRequests(friendRequests);
      setSentRequests(sentFriendRequests);
      setFriends(friendList);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const channel = subscribeToFriendChanges(async (payload) => {
      try {
        const newRequest = payload.new;

        if (payload.eventType === "INSERT") {
          const isSender =
            String(newRequest.senderId) === String(currentUser.id);

          const isReceiver =
            String(newRequest.receiverId) === String(currentUser.id);

          if (isReceiver && newRequest.status === "pending") {
            const friendRequests = await getFriendRequestsService(
              currentUser.id,
            );

            setRequests(friendRequests);
          }

          if (isSender && newRequest.status === "pending") {
            const sentFriendRequests = await getSentFriendRequestsService(
              currentUser.id,
            );

            setSentRequests(sentFriendRequests);
          }

          if (isSender || isReceiver) {
            const allUsers = await getVisibleUsers(currentUser.id);

            setUsers(allUsers);
          }

          return;
        }

        if (payload.eventType === "UPDATE") {
          const isSender =
            String(newRequest.senderId) === String(currentUser.id);

          const isReceiver =
            String(newRequest.receiverId) === String(currentUser.id);

          if (newRequest.status === "pending" && (isSender || isReceiver)) {
            if (isSender) {
              const sentFriendRequests = await getSentFriendRequestsService(
                currentUser.id,
              );

              setSentRequests(sentFriendRequests);
            }

            if (isReceiver) {
              const friendRequests = await getFriendRequestsService(
                currentUser.id,
              );

              setRequests(friendRequests);
            }

            const allUsers = await getVisibleUsers(currentUser.id);

            setUsers(allUsers);

            return;
          }

          if (
            (newRequest.status === "cancelled" ||
              newRequest.status === "rejected") &&
            (isSender || isReceiver)
          ) {
            if (isSender) {
              setSentRequests((previousRequests) =>
                previousRequests.filter(
                  (request) => request.id !== newRequest.id,
                ),
              );
            }

            if (isReceiver) {
              setRequests((previousRequests) =>
                previousRequests.filter(
                  (request) => request.id !== newRequest.id,
                ),
              );
            }

            const allUsers = await getVisibleUsers(currentUser.id);
            setUsers(allUsers);
            return;
          }

          if (newRequest.status === "accepted" && (isSender || isReceiver)) {
            const [friendList, friendRequests, sentFriendRequests, allUsers] =
              await Promise.all([
                getFriendsService(currentUser.id),
                getFriendRequestsService(currentUser.id),
                getSentFriendRequestsService(currentUser.id),
                getVisibleUsers(currentUser.id),
              ]);

            setFriends(friendList);
            setRequests(friendRequests);
            setSentRequests(sentFriendRequests);
            setUsers(allUsers);

            return;
          }
        }
        if (payload.eventType === "DELETE") {
          const oldRequest = payload.old;

          const isSender =
            String(oldRequest.senderId) === String(currentUser.id);

          const isReceiver =
            String(oldRequest.receiverId) === String(currentUser.id);

          if (!isSender && !isReceiver) {
            return;
          }

          const [friendList, friendRequests, sentFriendRequests, allUsers] =
            await Promise.all([
              getFriendsService(currentUser.id),
              getFriendRequestsService(currentUser.id),
              getSentFriendRequestsService(currentUser.id),
              getVisibleUsers(currentUser.id),
            ]);

          setFriends(friendList);
          setRequests(friendRequests);
          setSentRequests(sentFriendRequests);
          setUsers(allUsers);
        }
      } catch (error) {
        console.error("Error handling friend realtime update:", error);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const handleAccept = async (requestId) => {
    try {
      if (!currentUser) return;

      await acceptFriendRequestService(requestId, currentUser.id);

      setRequests((previousRequests) =>
        previousRequests.filter((request) => request.id !== requestId),
      );

      const friendList = await getFriendsService(currentUser.id);

      setFriends(friendList);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleDelete = async (requestId) => {
    try {
      if (!currentUser) return;

      await deleteFriendRequestService(requestId);

      setRequests((previousRequests) =>
        previousRequests.filter((request) => request.id !== requestId),
      );
    } catch (error) {
      console.error("Error deleting friend request:", error);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      if (!currentUser) return;

      await deleteFriendRequestService(requestId);

      setSentRequests((previousRequests) =>
        previousRequests.filter((request) => request.id !== requestId),
      );
    } catch (error) {
      console.error("Error cancelling friend request:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container-fluid">
        <div className="row">
          <aside className="col-md-3 col-lg-3 desktop-sidebar">
            <Sidebar />
          </aside>

          <main className="col-12 col-md-9 col-lg-9 py-4">
            <h2 className="fw-bold mb-4">Friends</h2>

            <div className="row g-4">
              <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">Friend Requests</h5>

                    {requests.length === 0 ? (
                      <p className="text-muted mb-0">No friend requests.</p>
                    ) : (
                      requests.map((request) => (
                        <FriendRequest
                          key={request.id}
                          request={request}
                          onAccept={handleAccept}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">Friends</h5>

                    {friends.length === 0 ? (
                      <p className="text-muted mb-0">No friends yet.</p>
                    ) : (
                      <FriendList friends={friends} />
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">Sent Requests</h5>

                    {sentRequests.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted mb-0">
                          You haven't sent any friend requests.
                        </p>
                      </div>
                    ) : (
                      sentRequests.map((request) => (
                        <SentRequest
                          key={request.id}
                          request={request}
                          onCancel={handleCancelRequest}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <AllUsers
                      users={users}
                      currentUser={currentUser}
                      friends={friends}
                      sentRequests={sentRequests}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Friends;
