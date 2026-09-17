import { Outlet } from "react-router-dom";
import AdminSidebar from "./adminSidebar";
import AdminNavbar from "./adminNavbar";

const AdminLayout = () => {
  return (
    <div
      className="d-flex bg-light"
      style={{ minHeight: "100vh" }}
    >
      <AdminSidebar />

      <div className="flex-grow-1 overflow-hidden">
        <AdminNavbar />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;