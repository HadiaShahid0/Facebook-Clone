import { useState } from "react";
import { X } from "react-feather";

import {
  dismissReportsService,
  temporarySuspendUserService,
  permanentSuspendUserService,
} from "../services/adminServices";

const UserReportModal = ({ user, onClose, onAction }) => {
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return null;
  }

  const reportedUser = user.reportedUser;

  const hasPendingReport = user.reports.some(
    (report) => report.status === "pending",
  );

  const handleAction = async () => {
    if (!action) {
      return;
    }

    setLoading(true);

    try {
      if (action === "dismiss") {
        await dismissReportsService(reportedUser.id, reason);
      }

      if (action === "temporary") {
        const date = new Date();

        if (days === "1min") {
          date.setMinutes(date.getMinutes() + 1);
        } else {
          date.setDate(date.getDate() + Number(days));
        }

        await temporarySuspendUserService(
          reportedUser.id,
          reason,
          date.toISOString(),
        );
      }

      if (action === "permanent") {
        await permanentSuspendUserService(reportedUser.id, reason);
      }

      onAction();
      onClose();
    } catch (error) {
      console.error("Moderation action error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 rounded-4">

          {/* Header */}
          <div className="modal-header">
            <div>
              <h5 className="modal-title fw-bold mb-1">
                Reports for {reportedUser?.username}
              </h5>

              <small className="text-muted">
                Total Reports: {user.count}
              </small>
            </div>

            <button
              className="btn btn-light rounded-circle"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Reports */}
            {user.reports.map((report, index) => (
              <div key={report.id} className="border rounded-4 p-3 mb-3">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={
                        report.reporter?.profileImage ||
                        `https://ui-avatars.com/api/?name=${report.reporter?.username}`
                      }
                      alt=""
                      className="rounded-circle"
                      width="42"
                      height="42"
                    />

                    <div>
                      <small className="text-muted d-block">
                        Reported by
                      </small>

                      <span className="fw-semibold">
                        {report.reporter?.username || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <small className="text-muted">
                    Report #{index + 1}
                  </small>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      Category
                    </small>

                    <span className="fw-semibold">
                      {report.category}
                    </span>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted d-block">
                      Reason
                    </small>

                    <span className="fw-semibold">
                      {report.reason}
                    </span>
                  </div>

                  <div className="col-12">
                    <small className="text-muted d-block">
                      Description
                    </small>

                    <p className="mb-0">
                      {report.description || "No description provided."}
                    </p>
                  </div>

                  <div className="col-12">
                    <small className="text-muted">
                      Reported on{" "}
                      {new Date(report.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>
            ))}

            {/* Moderation */}
            <div className="border-top pt-4 mt-4">
              <h6 className="fw-bold mb-3">
                Moderation Action
              </h6>

              {!hasPendingReport ? (
                <div className="alert alert-light border mb-0">
                  <strong>Report handled</strong>

                  <div className="text-muted small mt-1">
                    This report has already been handled and cannot be changed.
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label">
                      Action
                    </label>

                    <select
                      className="form-select"
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                    >
                      <option value="">
                        Select action
                      </option>

                      <option value="dismiss">
                        Dismiss Reports
                      </option>

                      <option value="temporary">
                        Temporary Suspend
                      </option>

                      <option value="permanent">
                        Permanent Suspend
                      </option>
                    </select>
                  </div>

                  {action === "temporary" && (
                    <div className="mb-3">
                      <label className="form-label">
                        Suspension Duration
                      </label>

                      <select
                        className="form-select"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                      >
                        <option value="1min">1 Minute</option>
                        <option value="1">1 Day</option>
                        <option value="3">3 Days</option>
                        <option value="7">7 Days</option>
                        <option value="30">30 Days</option>
                      </select>
                    </div>
                  )}

                  {action && (
                    <div className="mb-3">
                      <label className="form-label">
                        Admin Reason
                      </label>

                      <textarea
                        className="form-control"
                        rows="3"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter reason..."
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>

            {hasPendingReport && action && (
              <button
                className={`btn ${
                  action === "dismiss"
                    ? "btn-warning"
                    : "btn-danger"
                }`}
                onClick={handleAction}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : action === "dismiss"
                    ? "Dismiss Reports"
                    : action === "temporary"
                      ? "Temporary Suspend"
                      : "Permanent Suspend"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserReportModal;
