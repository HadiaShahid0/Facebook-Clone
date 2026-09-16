import { useEffect, useState } from "react";
import { Shield, User } from "react-feather";
import { getSuspendedUsersService } from "../services/adminServices";

const SuspendedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuspendedUsers();
  }, []);

  const loadSuspendedUsers = async () => {
    try {
      const data = await getSuspendedUsersService();
      setUsers(data);
    } catch (error) {
      console.error("Error loading suspended users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Suspended Users</h4>

        <p className="text-muted mb-0">
          View users whose accounts are currently suspended.
        </p>
      </div>

      <div className="bg-white rounded-4 shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-muted py-5">
            <Shield size={35} className="mb-2" />

            <div>No suspended users.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr className="text-muted">
                  <th>User</th>
                  <th>Suspension Type</th>
                  <th>Reason</th>
                  <th>Suspended Until</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt=""
                            className="rounded-circle"
                            width="40"
                            height="40"
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                            style={{
                              width: "40px",
                              height: "40px",
                            }}
                          >
                            <User size={18} />
                          </div>
                        )}

                        <span className="fw-semibold">
                          {user.username}
                        </span>
                      </div>
                    </td>

                    <td>
                      {user.suspensionType === "temporary" ? (
                        <span className="badge bg-warning text-dark">
                          Temporary
                        </span>
                      ) : user.suspensionType === "permanent" ? (
                        <span className="badge bg-danger">
                          Permanent
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          Under Review
                        </span>
                      )}
                    </td>

                    <td>
                      {user.suspensionReason || "No reason"}
                    </td>

                    <td>
                      {user.suspendedUntil
                        ? new Date(user.suspendedUntil).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspendedUsers;