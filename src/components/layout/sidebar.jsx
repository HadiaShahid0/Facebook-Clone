import { Bell, User, Users , Bookmark} from "react-feather";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className=" col-lg-3 col-md-3">
      <div className="sidebar-sticky">
        <div className="list-group ">
          <Link
            to="/profile"
            style={{ color: "black" }}
            className="text-decoration-none fw-bold ms-3 py-3 d-flex align-items-center gap-2 text-black "
          >
            Profile
          </Link>

          <Link
            to="/friends"
            style={{ color: "black" }}
            className="text-decoration-none fw-bold ms-3 py-3 d-flex align-items-center gap-2 text-black"
          >
            Friends
          </Link>

          <Link
            to="/notifications"
            style={{ color: "black" }}
            className="text-decoration-none fw-bold ms-3 py-3 d-flex align-items-center gap-2 text-black"
          >
            Notifications
          </Link>

          <Link
            to="/saved-posts"
            style={{ color: "black", whiteSpace:"nowrap" }}
            className="text-decoration-none fw-bold ms-3 py-3 d-flex align-items-center gap-2 text-black"
          >
            Saved Posts
          </Link>
           <Link
            to="/blocked-users"
            style={{ color: "black", whiteSpace:"nowrap" }}
            className="text-decoration-none fw-bold ms-3 py-3 d-flex align-items-center gap-2 text-black"
          >
            Blocked Users
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
