import { useEffect, useState } from "react";
import {
  Bell,
  Home,
  Users,
  User,
  LogOut,
  MessageCircle,
  Search,
  Bookmark,
} from "react-feather";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getAvatarUrl } from "../../services/profileImageServices";

import { getBlockedUserIdsService } from "../../features/user/profile/services/profileServices";
import { supabase } from "../../utils/supabase";

const Navbar = () => {
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const loadNotificationCounts = async (userId) => {
    const { data, error } = await supabase
      .from("notification")
      .select("type")
      .eq("userId", userId)
      .eq("isRead", false);

    if (error) {
      console.error("Error loading notification counts:", error);
      return;
    }

    const messageTypes = ["message", "messageRequest"];

    const messageCount = data.filter((notification) =>
      messageTypes.includes(notification.type),
    ).length;

    setUnreadCount(data.length);
    setMessageUnreadCount(messageCount);
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (!search.trim() || !userId) {
        setUsers([]);
        return;
      }

      try {
        const blockedUserIds = await getBlockedUserIdsService(userId);

        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, profileImage,isAdmin,isSuspended")
          .ilike("username", `%${search}%`)
          .neq("id", userId)
          .limit(10);

        if (error) {
          console.error("Error searching users:", error);
          return;
        }

        const visibleUsers = (data || []).filter(
          (user) => !blockedUserIds.includes(user.id) && !user.isAdmin && !user.isSuspended,
        );

        setUsers(visibleUsers.slice(0, 5));
      } catch (error) {
        console.error("Error searching users:", error);
      }
    };

    const timer = setTimeout(searchUsers, 300);

    return () => clearTimeout(timer);
  }, [search, userId]);

  useEffect(() => {
    let channel;
    let isActive = true;

    const setupNotifications = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting current user:", error);
        return;
      }

      if (!user || !isActive) return;

      setUserId(user.id);

      await loadNotificationCounts(user.id);

      if (!isActive) return;

      channel = supabase.channel(`navbar-notifications-${user.id}`);

      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.isRead) return;

          const isMessageNotification = ["message", "messageRequest"].includes(
            payload.new.type,
          );

          if (isMessageNotification) {
            setMessageUnreadCount((count) => count + 1);
          }

          setUnreadCount((count) => count + 1);
        },
      );

      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notification",
          filter: `userId=eq.${user.id}`,
        },
        () => {
          loadNotificationCounts(user.id);
        },
      );

      channel.subscribe();
    };

    setupNotifications();

    return () => {
      isActive = false;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    if (userId) {
      loadNotificationCounts(userId);
    }
  }, [location.pathname, userId]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error);
    } else {
      window.location.href = "/login";
    }
  };

  const handleUserClick = (id) => {
    setSearch("");
    setUsers([]);

    navigate(`/profile/${id}`);
  };

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top navbar-height d-none d-md-block">
        <div className="container-fluid px-3">
          <div className="d-flex align-items-center gap-3">
            <Link
              to="/"
              className="text-decoration-none text-primary fw-bold"
              style={{ fontSize: "22px" }}
            >
              Clone
            </Link>

            <div className="position-relative" style={{ width: "280px" }}>
              <div
                className="d-flex align-items-center bg-light rounded-pill px-3"
                style={{ height: "42px" }}
              >
                <Search size={18} className="text-secondary me-2" />

                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none p-0"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {search.trim() && (
                <SearchResults users={users} onUserClick={handleUserClick} />
              )}
            </div>
          </div>

          {/* Center: Navigation */}
          <div className="d-flex align-items-center gap-4 position-absolute start-50 translate-middle-x">
            <Link to="/" className="btn btn-light text-primary">
              <Home size={22} />
            </Link>

            <Link to="/friends" className="btn btn-light">
              <Users size={22} />
            </Link>

            <Link to="/chat" className="btn btn-light position-relative">
              <MessageCircle size={22} />

              {messageUnreadCount > 0 && (
                <NotificationBadge count={messageUnreadCount} />
              )}
            </Link>
          </div>

          {/* Right: Notifications + Profile + Logout */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <Link
              to="/notifications"
              className="btn btn-light rounded-circle position-relative"
            >
              <Bell size={20} />

              {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
            </Link>

            {userId && (
              <Link
                to={`/profile/${userId}`}
                className="btn btn-light rounded-circle"
              >
                <User size={20} />
              </Link>
            )}

            <button
              className="btn btn-light rounded-circle"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE TOP NAVBAR ================= */}
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top navbar-height d-md-none">
        <div className="container-fluid px-3">
          {/* Logo */}
          <Link
            to="/"
            className="text-decoration-none text-primary fw-bold"
            style={{ fontSize: "21px" }}
          >
            Clone
          </Link>

          {/* Search + Logout */}
          <div className="d-flex align-items-center ms-2">
            <div className="position-relative" style={{ width: "150px" }}>
              <div
                className="d-flex align-items-center bg-light rounded-pill px-2"
                style={{ height: "36px" }}
              >
                <Search size={16} className="text-secondary me-1" />

                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none p-0"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {search.trim() && (
                <SearchResults users={users} onUserClick={handleUserClick} />
              )}
            </div>

            <button
              className="btn btn-light rounded-circle ms-2 p-2"
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE BOTTOM NAVBAR ================= */}
      <div className="d-md-none fixed-bottom bg-white border-top shadow-sm">
        <div className="d-flex justify-content-around align-items-center py-2">
          <MobileNavItem to="/" icon={<Home size={21} />} label="Home" />

          <MobileNavItem
            to="/friends"
            icon={<Users size={21} />}
            label="Friends"
          />

          <MobileNavItem
            to="/chat"
            icon={<MessageCircle size={21} />}
            label="Chat"
            badge={messageUnreadCount}
          />

          <MobileNavItem
            to="/saved-posts"
            icon={<Bookmark size={21} />}
            label="Saved"
          />

          <MobileNavItem
            to="/notifications"
            icon={<Bell size={21} />}
            label="Notifications"
            badge={unreadCount}
          />

          {userId && (
            <MobileNavItem
              to={`/profile/${userId}`}
              icon={<User size={21} />}
              label="Profile"
            />
          )}
        </div>
      </div>
    </>
  );
};

const SearchResults = ({ users, onUserClick }) => {
  return (
    <div
      className="position-absolute bg-white shadow rounded-3 mt-2 w-100 overflow-hidden"
      style={{ zIndex: 1050 }}
    >
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.id}
            className="d-flex align-items-center gap-3 px-3 py-2"
            style={{ cursor: "pointer" }}
            onClick={() => onUserClick(user.id)}
          >
            <img
              src={user.profileImage || getAvatarUrl(user)}
              alt={user.username}
              className="rounded-circle"
              width="40"
              height="40"
            />

            <span className="fw-semibold">{user.username}</span>
          </div>
        ))
      ) : (
        <div className="px-3 py-3 text-muted">No users found</div>
      )}
    </div>
  );
};

const MobileNavItem = ({ to, icon, label, badge = 0 }) => {
  return (
    <Link
      to={to}
      className="text-decoration-none text-dark d-flex flex-column align-items-center position-relative"
      style={{ fontSize: "11px" }}
    >
      {icon}

      {badge > 0 && <NotificationBadge count={badge} />}

      <span className="mt-1">{label}</span>
    </Link>
  );
};

const NotificationBadge = ({ count }) => {
  return (
    <span
      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
      style={{
        fontSize: "8px",
        minWidth: "17px",
        height: "17px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default Navbar;
