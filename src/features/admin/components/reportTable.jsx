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
            <th className="text-nowrap">Total Reports</th>
            <th>Latest Reason</th>
            <th className="text-nowrap">Status</th>
            <th className="text-nowrap">Action</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((item) => {
            const user = item.reportedUser;
            const latestReport = item.reports[0];

            let status = "Pending";
            let statusClass = "bg-warning text-dark";

            if (latestReport?.status === "dismissed") {
              status = "Dismissed";
              statusClass = "bg-secondary";
            } else if (latestReport?.status === "reviewed") {
              status = "Reviewed";
              statusClass = "bg-success";
            } else if (
              user?.isSuspended &&
              user?.suspensionType === "temporary"
            ) {
              status = "Temporary Suspended";
              statusClass = "bg-danger";
            } else if (
              user?.isSuspended &&
              user?.suspensionType === "permanent"
            ) {
              status = "Permanent Suspended";
              statusClass = "bg-danger";
            } else if (latestReport?.status === "action_taken") {
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
                      className="rounded-circle flex-shrink-0"
                      width="40"
                      height="40"
                    />

                    <span className="fw-semibold text-nowrap">
                      {user?.username || "Unknown"}
                    </span>
                  </div>
                </td>

                {/* Count */}
                <td className="text-nowrap">
                  <span className="badge bg-danger">
                    {item.count}{" "}
                    {item.count === 1 ? "Report" : "Reports"}
                  </span>
                </td>

                {/* Reason */}
                <td>
                  <span className="text-nowrap">
                    {latestReport?.reason || "No reason"}
                  </span>
                </td>

                {/* Status */}
                <td className="text-nowrap">
                  <span className={`badge ${statusClass}`}>
                    {status}
                  </span>
                </td>

                {/* Action */}
                <td className="text-nowrap">
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
