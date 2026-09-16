import { MessageCircle } from "react-feather";

const UserList = ({ users, selectedUser, onSelectUser }) => {
  return (
    <div>
      {users.length === 0 ? (
        <div className="text-center p-4">
          <MessageCircle size={30} className="text-muted mb-2" />

          <p className="text-muted small mb-0">No conversations yet.</p>
        </div>
      ) : (
        users.map((user) => (
          <button
            key={user.id}
            type="button"
            className={`btn w-100 text-start border-0 rounded-0 ${
              selectedUser?.id === user.id ? "bg-light" : ""
            }`}
            onClick={() => onSelectUser(user)}
          >
            <div className="d-flex align-items-center p-2">
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

              <div className="overflow-hidden">
                <strong>{user.username}</strong>

                <div
                  className="small text-muted text-truncate"
                  style={{ maxWidth: "200px" }}
                >
                  Click to open chat
                </div>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
};

export default UserList;
