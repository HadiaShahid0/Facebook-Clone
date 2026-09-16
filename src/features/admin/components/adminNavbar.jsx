import { Bell, Search } from "react-feather";

const AdminNavbar = () => {
  return (
    <div className="bg-white border-bottom px-4 py-3">
      <div className="d-flex justify-content-end align-items-center">
        


        {/* Right */}
        <div className="d-flex align-items-center gap-4">
         

          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "38px", height: "38px" }}
            >
              A
            </div>

            <div>
              <small className="fw-semibold d-block">
                Admin
              </small>
              <small className="text-muted">
                Administrator
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;