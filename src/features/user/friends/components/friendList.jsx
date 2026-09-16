import { getAvatarUrl } from "../../../../services/profileImageServices";
import { Users } from "react-feather";
import { useNavigate } from "react-router-dom";

const FriendList = ({ friends }) => {
  const navigate = useNavigate();

  const handleFriendClick = (friendId) => {
    navigate(`/profile/${friendId}`);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-3">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-secondary mb-0">Friends</h6>

          <Users size={19} className="text-secondary" />
        </div>

        <div className="d-flex flex-column gap-1">
          {friends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              onClick={() => handleFriendClick(friend.id)}
              className="btn btn-light border-0 d-flex align-items-center text-start rounded-3 p-2"
            >
              <div className="position-relative me-3">
                <img
                  src={friend.profileImage || getAvatarUrl(friend)}
                  alt={friend.username}
                  width="40"
                  height="40"
                  className="rounded-circle"
                />
              </div>

              <div className="flex-grow-1">
                <div className="fw-semibold">{friend.username}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendList;
