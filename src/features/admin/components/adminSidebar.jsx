import {
  BarChart2,
  Flag,
  Shield,
  LogOut,
} from "react-feather";
import { NavLink } from "react-router-dom";
import { supabase } from "../../../utils/supabase";

const AdminSidebar = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error);
    } else {
      window.location.href = "/login";
    }
  };

  const linkClass = ({ isActive }) =>
    `d-flex align-items-center gap-2 gap-md-3 text-decoration-none rounded-3 px-2 px-md-3 py-2 mb-1 ${
      isActive ? "bg-primary text-white" : "text-dark"
    }`;

  return (
    <div
      className="bg-white border-end d-flex flex-column"
      style={{
        width: "clamp(65px, 20vw, 250px)",
        minHeight: "100vh",
      }}
    >
      {/* Logo */}
      <div className="p-2 p-md-4 border-bottom">
        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
          <div
            className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "40px",
              height: "40px",
            }}
          >
            <Shield size={22} />
          </div>

          <div className="overflow-hidden d-none d-md-block">
            <h6 className="fw-bold mb-0 text-truncate">
              Clone Admin
            </h6>

            <small className="text-muted text-truncate d-block">
              Management Panel
            </small>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="p-2 p-md-3 flex-grow-1">
        <small className="text-uppercase text-muted px-2 px-md-3 d-none d-md-block">
          Main Menu
        </small>

        <div className="mt-2">
          <NavLink
            to="/admin"
            end
            className={linkClass}
            title="Dashboard"
          >
            <BarChart2 size={19} />
            <span className="d-none d-md-inline">
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to="/admin/reported-users"
            className={linkClass}
            title="Reports"
          >
            <Flag size={19} />
            <span className="d-none d-md-inline">
              Reports
            </span>
          </NavLink>

          <NavLink
            to="/admin/suspended-users"
            className={linkClass}
            title="Suspended Users"
          >
            <Shield size={19} />
            <span className="d-none d-md-inline">
              Suspended Users
            </span>
          </NavLink>
        </div>
      </div>

      {/* Logout */}
      <div className="p-2 p-md-3 border-top">
        <button
          className="btn btn-light w-100 d-flex align-items-center justify-content-center justify-content-md-start gap-2 gap-md-3"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={19} />
          <span className="d-none d-md-inline">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;