import { useParams } from "react-router-dom";

const UserReports = () => {
  const { userId } = useParams();

  return (
    <div className="p-4">
      <h3 className="fw-bold">
        User Reports
      </h3>

      <p className="text-muted">
        Reports for user: {userId}
      </p>
    </div>
  );
};

export default UserReports;