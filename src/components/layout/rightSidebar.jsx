import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MessageCircle } from "react-feather";

import { getCurrentUserService } from "../../features/auth/services/authServices";
import { getFriendsService } from "../../features/user/friends/services/friendServices";
import { getAvatarUrl } from "../../services/profileImageServices";

const RightSidebar = () => {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const user = await getCurrentUserService();

        if (!user) {
          return;
        }

        const data = await getFriendsService(user.id);

        setFriends(data);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessageClick = (userId) => {
    navigate(`/chat/${userId}`);
  };


  return (
    <div className="desktop-right-sidebar">
      <div className="sidebar-sticky">
        <div className="card border-0 shadow-sm rounded-4 mb-3">
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-secondary mb-0">Friends</h6>

              <Users size={19} className="text-secondary" />
            </div>

            {loading ? (
              <div className="text-center py-3">
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : friends.length === 0 ? (
              <p className="text-muted small mb-0">
                You don't have any friends yet.
              </p>
            ) : (
              <div className="d-flex flex-column gap-1">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="d-flex align-items-center rounded-3 p-2"
                  >
                    {/* Profile */}
                    <button
                      type="button"
                      className="btn btn-light border-0 d-flex align-items-center text-start p-0 flex-grow-1"
                      onClick={() => handleUserClick(friend.id)}
                    >
                      <img
                        src={friend.profileImage || getAvatarUrl(friend)}
                        alt={friend.username}
                        width="40"
                        height="40"
                        className="rounded-circle object-fit-cover me-3"
                      />

                      <div className="fw-semibold">{friend.username}</div>
                    </button>

                    {/* Message */}
                    <button
                      type="button"
                      className="btn btn-light rounded-circle ms-2"
                      onClick={() => handleMessageClick(friend.id)}
                      title="Message"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
