import { getAvatarUrl } from "../../services/profileImageServices";
const FriendCard = ({ friend }) => {
  return (
    <div className="card border-0 shadow-sm">
      <img
        src={friend.profileImage || getAvatarUrl(friend)}
        alt={friend.username}
        className="card-img-top"
        style={{
          height: "180px",
          objectFit: "cover",
        }}
      />

      <div className="card-body">
        <div className="fw-semibold">{friend.username}</div>

        <button className="btn btn-outline-secondary btn-sm mt-2">
          Friends
        </button>
      </div>
    </div>
  );
};

export default FriendCard;
