import { Check, X } from "react-feather";
import { getAvatarUrl } from "../../../../services/profileImageServices";
const FriendRequest = ({ request, onAccept, onDelete }) => {
  const user = request.sender;

  return (
    <div className="d-flex align-items-center mb-3">
      <img
        src={user.profileImage || getAvatarUrl(user)}
        alt={user.username}
        width="50"
        height="50"
        className="rounded-circle me-3"
      />

      <div className="flex-grow-1">
        <strong>{user.username}</strong>

        <div className="mt-2 d-flex gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onAccept(request.id)}
          >
            <Check size={16} className="me-1" />
            Accept
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onDelete(request.id)}
          >
            <X size={16} className="me-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequest;
