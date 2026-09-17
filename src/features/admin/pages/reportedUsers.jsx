import { useEffect, useState } from "react";

import { supabase } from "../../../utils/supabase";

import ReportTable from "../components/reportTable";
import UserReportModal from "../components/userReportModal";

import { getReportedUsersService } from "../services/adminServices";

const ReportedUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await getReportedUsersService();

      setUsers(data);
    } catch (error) {
      console.error("Error loading reported users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    const channel = supabase
      .channel("reported-users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "userReport",
        },
        () => {
          loadUsers();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <div className="p-2 p-sm-3 p-md-4">
      {/* Header */}
      <div className="mb-3 mb-md-4">
        <h3 className="fw-bold mb-1 fs-4 fs-md-3">Reported Users</h3>

        <p className="text-muted mb-0 small">
          Review users reported by the community.
        </p>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-2 p-sm-3 p-md-4">
          <ReportTable reports={users} onView={setSelectedUser} />
        </div>
      </div>

      {/* Modal */}
      <UserReportModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};

export default ReportedUsers;
