import { Clock, UserX } from "react-feather";
import { getAvatarUrl } from "../../../../services/profileImageServices";

const SentRequest = ({ request, onCancel }) => {
  const user = request?.profiles;

  if (!user) {
    return null;
  }

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body d-flex align-items-center">
        <img
          src={user.profileImage || getAvatarUrl(user)}
          alt={user.username}
          width="56"
          height="56"
          className="rounded-circle me-3"
          style={{
            objectFit: "cover",
          }}
        />

        <div className="flex-grow-1">
          <h6 className="mb-1 fw-semibold">{user.username}</h6>

          <div className="d-flex align-items-center text-muted small">
            <Clock size={14} className="me-1" />
            Request sent
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-flex align-items-center"
          onClick={() => onCancel(request.id)}
        >
          <UserX size={15} className="me-1" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SentRequest;
