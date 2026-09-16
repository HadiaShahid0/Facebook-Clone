const ReportTable = ({ reports, onView }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        No reports found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr className="text-muted">
            <th>User</th>
            <th>Total Reports</th>
            <th>Latest Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((item) => {
            const user = item.reportedUser;
            const latestReport = item.reports[0];

            let status = "Pending";
            let statusClass = "bg-warning text-dark";

            // Report dismissed
            if (latestReport?.status === "dismissed") {
              status = "Dismissed";
              statusClass = "bg-secondary";
            }

            // Report reviewed
            else if (latestReport?.status === "reviewed") {
              status = "Reviewed";
              statusClass = "bg-success";
            }

            // User temporarily suspended
            else if (
              user?.isSuspended &&
              user?.suspensionType === "temporary"
            ) {
              status = "Temporary Suspended";
              statusClass = "bg-danger";
            }

            // User permanently suspended
            else if (
              user?.isSuspended &&
              user?.suspensionType === "permanent"
            ) {
              status = "Permanent Suspended";
              statusClass = "bg-danger";
            }

            // Some moderation action was taken
            else if (latestReport?.status === "action_taken") {
              status = "Action Taken";
              statusClass = "bg-danger";
            }

            return (
              <tr key={user.id}>
                {/* User */}
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={
                        user?.profileImage ||
                        `https://ui-avatars.com/api/?name=${user?.username}`
                      }
                      alt=""
                      className="rounded-circle"
                      width="40"
                      height="40"
                    />

                    <span className="fw-semibold">
                      {user?.username || "Unknown"}
                    </span>
                  </div>
                </td>

                {/* Count */}
                <td>
                  <span className="badge bg-danger">
                    {item.count}{" "}
                    {item.count === 1 ? "Report" : "Reports"}
                  </span>
                </td>

                {/* Reason */}
                <td>
                  {latestReport?.reason || "No reason"}
                </td>

                {/* Status */}
                <td>
                  <span className={`badge ${statusClass}`}>
                    {status}
                  </span>
                </td>

                {/* View */}
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onView(item)}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;