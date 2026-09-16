import {
  BarChart2,
  Flag,
  Users,
  Shield,
  Settings,
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
  
  return (
    <div
      className="bg-white border-end d-flex flex-column"
      style={{
        width: "250px",
        minHeight: "100vh",
      }}
    >
      {/* Logo */}
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div
            className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <Shield size={22} />
          </div>

          <div>
            <h6 className="fw-bold mb-0">Clone Admin</h6>
            <small className="text-muted">Management Panel</small>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="p-3 flex-grow-1">
        <small className="text-uppercase text-muted px-3">
          Main Menu
        </small>

        <div className="mt-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 text-decoration-none rounded-3 px-3 py-2 mb-1 ${
                isActive
                  ? "bg-primary text-white"
                  : "text-dark"
              }`
            }
          >
            <BarChart2 size={19} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/reported-users"
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 text-decoration-none rounded-3 px-3 py-2 mb-1 ${
                isActive
                  ? "bg-primary text-white"
                  : "text-dark"
              }`
            }
          >
            <Flag size={19} />
            Reports
          </NavLink>

          {/* <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 text-decoration-none rounded-3 px-3 py-2 mb-1 ${
                isActive
                  ? "bg-primary text-white"
                  : "text-dark"
              }`
            }
          >
            <Users size={19} />
            Users
          </NavLink> */}

          <NavLink
            to="/admin/suspended-users"
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 text-decoration-none rounded-3 px-3 py-2 mb-1 ${
                isActive
                  ? "bg-primary text-white"
                  : "text-dark"
              }`
            }
          >
            <Shield size={19} />
            Suspended Users
          </NavLink>
        </div>

        {/* <small className="text-uppercase text-muted px-3 d-block mt-4">
          System
        </small>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `d-flex align-items-center gap-3 text-decoration-none rounded-3 px-3 py-2 mt-2 ${
              isActive
                ? "bg-primary text-white"
                : "text-dark"
            }`
          }
        >
          <Settings size={19} />
          Settings
        </NavLink> */}
      </div>

      {/* Logout */}
      <div className="p-3 border-top">
        <button className="btn btn-light w-100 d-flex align-items-center gap-3" onClick={handleLogout}>
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;