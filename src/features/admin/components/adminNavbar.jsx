import { useEffect, useState } from "react";
import { Bell } from "react-feather";
import { useLocation, useNavigate } from "react-router-dom";

import { getCurrentUserService } from "../../auth/services/authServices";

import { getNotificationsService } from "../../user/notification/services/notificationServices";

import { subscribeToNotificationChangesServices } from "../../user/notification/services/notificationReatimeService";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  const isNotificationPage = location.pathname === "/admin/notifications";

  const loadNotifications = async () => {
    try {
      const user = await getCurrentUserService();

      if (!user) return;

      const notifications = await getNotificationsService(user.id);

      const unreadCount = notifications.filter(
        (notification) => !notification.isRead,
      ).length;

      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  useEffect(() => {
    let channel;

    const setupNotifications = async () => {
      try {
        const user = await getCurrentUserService();

        if (!user) return;

        await loadNotifications();

        channel = subscribeToNotificationChangesServices(user.id, () => {
          loadNotifications();
        });
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  return (
    <div className="bg-white border-bottom px-2 px-md-4 py-2 py-md-3">
      <div className="d-flex justify-content-end align-items-center">
        <div className="d-flex align-items-center gap-2">
          {/* Notification */}
          <button
            className="btn btn-light position-relative rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "40px",
              height: "40px",
            }}
            onClick={() => navigate("/admin/notifications")}
          >
            <Bell size={20} />

            {/* Hide counter while notification page is open */}
            {!isNotificationPage && unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "10px" }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Admin Avatar */}
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "38px",
              height: "38px",
            }}
          >
            A
          </div>

          {/* Admin Name */}
          <div>
            <small className="fw-semibold d-block">Admin</small>

            <small className="text-muted d-none d-md-block">
              Administrator
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
