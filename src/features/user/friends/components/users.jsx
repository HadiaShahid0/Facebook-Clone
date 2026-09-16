import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Clock, Users } from "react-feather";

import { getAvatarUrl } from "../../../../services/profileImageServices";

import { sendFriendRequestService } from "../services/friendServices";

const AllUsers = ({
  users = [],
  currentUser,
  sentRequests = [],
  friends = [],
}) => {
  const navigate = useNavigate();

  const [sendingRequest, setSendingRequest] = useState([]);

  const friendIds = new Set(friends.map((friend) => friend.id));

  const availableUsers = users.filter(
    (user) => user.id !== currentUser?.id && !friendIds.has(user.id) ,
  );
  const handleSendRequest = async (receiverId) => {
    const alreadySent=  sentRequests.some(
        (request) => String(request.receiverId) === String(receiverId),
      ) 
    if (
      !currentUser ||
      sendingRequest.includes(receiverId) ||
     alreadySent
    ) {
      return;
    }

    try {
      setSendingRequest((previous) => [...previous, receiverId]);

      await sendFriendRequestService({
        senderId: currentUser.id,
        receiverId,
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setSendingRequest((previous) =>
        previous.filter((id) => id !== receiverId),
      );
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "44px",
              height: "44px",
            }}
          >
            <Users size={21} color="white" />
          </div>

          <div>
            <h5 className="fw-bold mb-0">People You May Know</h5>

            <small className="text-muted">
              Connect with people you may know
            </small>
          </div>
        </div>

        {availableUsers.length > 0 && (
          <span className="badge bg-light text-secondary border rounded-pill px-3 py-2">
            {availableUsers.length} people
          </span>
        )}
      </div>

      {availableUsers.length === 0 ? (
        <div className="text-center py-5">
          <div
            className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: "70px",
              height: "70px",
            }}
          >
            <Users size={32} className="text-secondary" />
          </div>

          <h6 className="fw-bold">No new people to add</h6>

          <p className="text-muted small mb-0">
            You're already connected with everyone available.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {availableUsers.map((user) => {
            const requestIsSent = sentRequests.some(
              (request) => String(request.receiverId) === String(user.id),
            );

            const isSending = sendingRequest.includes(user.id);

            return (
              <div key={user.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div
                  className="card h-100 border shadow-sm rounded-4 overflow-hidden user-card"
                  role="button"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div
                    className="bg-light"
                    style={{
                      height: "220px",
                    }}
                  >
                    <img
                      src={user.profileImage || getAvatarUrl(user)}
                      alt={user.username}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>

                  {/* User Information */}
                  <div className="card-body p-3">
                    <h6
                      className="fw-bold mb-1 text-truncate"
                      title={user.username}
                    >
                      {user.username}
                    </h6>

                    <small className="text-muted d-block mb-3">
                      Suggested for you
                    </small>

                    {/* Pending */}
                    {requestIsSent ? (
                      <button
                        type="button"
                        className="btn btn-light border w-100 rounded-3 fw-semibold text-secondary"
                        disabled
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Clock size={16} className="me-1" />
                        Pending
                      </button>
                    ) : (
                      /* Add Friend */
                      <button
                        type="button"
                        className="btn btn-primary w-100 rounded-3 fw-semibold"
                        disabled={isSending}
                        onClick={(event) => {
                          event.stopPropagation();

                          handleSendRequest(user.id);
                        }}
                      >
                        {isSending ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} className="me-1" />
                            Add Friend
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllUsers;
