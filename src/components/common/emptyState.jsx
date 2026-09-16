import { Inbox } from "react-feather";

const EmptyState = ({
  title = "Nothing here yet",
  message = "There is nothing to show right now.",
}) => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body text-center py-5">
        <div className="text-muted mb-3">
          <Inbox size={48} />
        </div>

        <h5 className="fw-bold">{title}</h5>

        <p className="text-muted mb-0">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
