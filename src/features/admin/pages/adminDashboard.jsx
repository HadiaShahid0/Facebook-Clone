import { useEffect, useState } from "react";
import { Flag, Shield, Users, AlertTriangle } from "react-feather";

import { supabase } from "../../../utils/supabase";

import StatCard from "../components/statCard";
import ReportTable from "../components/reportTable";
import UserReportModal from "../components/userReportModal";

import {
  getTotalUsersService,
  getTotalReportsService,
  getPendingReportsService,
  getTotalSuspendedUsersService,
  getRecentReportedUsersService,
} from "../services/adminServices";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    suspendedUsers: 0,
  });

  const [reports, setReports] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const [
        totalUsers,
        totalReports,
        pendingReports,
        suspendedUsers,
        recentReports,
      ] = await Promise.all([
        getTotalUsersService(),
        getTotalReportsService(),
        getPendingReportsService(),
        getTotalSuspendedUsersService(),
        getRecentReportedUsersService(),
      ]);

      setStats({
        totalUsers,
        totalReports,
        pendingReports,
        suspendedUsers,
      });

      setReports(recentReports);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const channel = supabase
      .channel("admin-dashboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "userReport",
        },
        () => {
          loadDashboard();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          loadDashboard();
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
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Dashboard</h3>

        <p className="text-muted mb-0">
          Monitor reports and manage your community.
        </p>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            text="All user reports"
            Icon={Flag}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <StatCard
            title="Pending Reports"
            value={stats.pendingReports}
            text="Need your attention"
            Icon={AlertTriangle}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <StatCard
            title="Suspended Users"
            value={stats.suspendedUsers}
            text="Currently suspended"
            Icon={Shield}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            text="Registered users"
            Icon={Users}
          />
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-1">Recent Reports</h5>

              <small className="text-muted">
                Users recently reported by the community
              </small>
            </div>
          </div>

          <ReportTable
            reports={reports}
            onView={setSelectedUser}
          />
        </div>
      </div>

      {/* Modal */}
      <UserReportModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onAction={loadDashboard}
      />
    </div>
  );
};

export default AdminDashboard;
