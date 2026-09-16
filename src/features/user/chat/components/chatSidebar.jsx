const ChatSidebar = ({
  friends,
  requests,
  selectedUser,
  onSelectUser,
  onSelectRequest,
  unreadMessages = {},
}) => {
  return (
    <div
      className="border-end bg-white"
      style={{
        width: "320px",
        overflowY: "auto",
      }}
    >
      <div className="p-3 border-bottom">
        <h4 className="mb-0">Messages</h4>
      </div>

      <div className="p-3">
        <h6 className="text-muted mb-3">Inbox</h6>

        {friends.length === 0 ? (
          <p className="text-muted small">No conversations yet.</p>
        ) : (
          friends.map((user) => {
            const unreadCount = unreadMessages[user.id] || 0;

            return (
              <button
                key={user.id}
                type="button"
                className={`btn w-100 text-start mb-2 ${
                  selectedUser?.id === user.id ? "bg-light" : ""
                }`}
                onClick={() => onSelectUser(user)}
              >
                <div className="d-flex align-items-center">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.username}
                      className="rounded-circle me-3"
                      style={{
                        width: "45px",
                        height: "45px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "45px",
                        height: "45px",
                        minWidth: "45px",
                      }}
                    >
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{user.username}</strong>

                      {unreadCount > 0 && (
                        <span className="badge bg-danger rounded-pill">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="small text-muted">Message</div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="p-3 border-top">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">Message Requests</h6>

          {requests.filter((request) => request.status === "pending").length >
            0 && (
            <span className="badge bg-danger">
              {
                requests.filter((request) => request.status === "pending")
                  .length
              }
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <p className="text-muted small">No message requests.</p>
        ) : (
          requests.map((request) => {
            const unreadCount = unreadMessages[request.sender?.id] || 0;

            return (
              <button
                key={request.id}
                type="button"
                className={`btn w-100 text-start mb-2 ${
                  selectedUser?.id === request.sender?.id ? "bg-light" : ""
                }`}
                onClick={() => onSelectRequest(request)}
              >
                <div className="d-flex align-items-center">
                  {request.sender?.profileImage ? (
                    <img
                      src={request.sender.profileImage}
                      alt={request.sender.username}
                      className="rounded-circle me-3"
                      style={{
                        width: "45px",
                        height: "45px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className={`rounded-circle text-white d-flex align-items-center justify-content-center me-3 ${
                        request.status === "rejected"
                          ? "bg-secondary"
                          : "bg-primary"
                      }`}
                      style={{
                        width: "45px",
                        height: "45px",
                        minWidth: "45px",
                      }}
                    >
                      {request.sender?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{request.sender?.username}</strong>

                      {unreadCount > 0 && request.status === "pending" && (
                        <span className="badge bg-danger rounded-pill">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>

                    {request.status === "rejected" ? (
                      <div className="small text-danger">Request rejected</div>
                    ) : (
                      <div className="small text-muted">Message request</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
