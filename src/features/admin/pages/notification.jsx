import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, FileText, AlertTriangle, Shield } from "react-feather";

import { supabase } from "../../../utils/supabase";

import { getCurrentUserService } from "../../auth/services/authServices";

import {
  getNotificationsService,
  getNotificationByIdService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "../../user/notification/services/notificationServices";

import { subscribeToNotificationChanges } from "../../user/notification/services/notificationReatimeService";

const AdminNotifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    const setupNotifications = async () => {
      try {
        const user = await getCurrentUserService();

        if (!user) {
          navigate("/login");
          return;
        }

        const data = await getNotificationsService(user.id);

        setNotifications(data || []);
        setLoading(false);

        channel = subscribeToNotificationChanges(user.id, async (payload) => {
          try {
            const notification = await getNotificationByIdService(
              payload.new.id,
            );

            setNotifications((previous) => {
              const exists = previous.some(
                (item) => item.id === notification.id,
              );

              if (exists) {
                return previous;
              }

              return [notification, ...previous];
            });
          } catch (error) {
            console.error("Error loading notification:", error);
          }
        });
      } catch (error) {
        console.error("Error loading admin notifications:", error);
        setLoading(false);
      }
    };

    setupNotifications();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [navigate]);

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationReadService(notificationId);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = await getCurrentUserService();

      if (!user) {
        navigate("/login");
        return;
      }

      await markAllNotificationsReadService(user.id);

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const getNotificationData = (notification) => {
    const username = notification.profiles?.username || "A user";

    switch (notification.type) {
      case "userReport":
        return {
          icon: <FileText size={20} />,
          title: "New User Report",
          text: "submitted a user report.",
        };

      case "userSuspended":
        return {
          icon: <AlertTriangle size={20} />,
          title: "User Suspended",
          text: "has been suspended.",
        };

      case "userUnsuspended":
        return {
          icon: <Shield size={20} />,
          title: "User Unsuspended",
          text: "has been unsuspended.",
        };

      default:
        return {
          icon: <Bell size={20} />,
          title: "New Notification",
          text: "You have a new notification.",
        };
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <div className="text-primary">
              <Bell size={25} />
            </div>

            <h3 className="fw-bold mb-0">Notifications</h3>
          </div>

          <p className="text-muted mb-0 mt-1">
            Stay updated with activity on your platform.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={markAllAsRead}
          >
            <Check size={17} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification Card */}
      <div className="card border-0 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-muted mb-3"
              style={{ width: "65px", height: "65px" }}
            >
              <Bell size={28} />
            </div>

            <h5 className="fw-semibold mb-1">No notifications</h5>

            <p className="text-muted mb-0">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => {
              const data = getNotificationData(notification);
              const sender = notification.profiles;

              return (
                <div
                  key={notification.id}
                  className={`px-3 px-md-4 py-3 border-bottom ${
                    !notification.isRead ? "bg-light" : ""
                  }`}
                  style={{
                    cursor: !notification.isRead ? "pointer" : "default",
                  }}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification.id)
                  }
                >
                  <div className="d-flex align-items-start gap-3">
                    {/* Icon */}
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary flex-shrink-0"
                      style={{
                        width: "46px",
                        height: "46px",
                      }}
                    >
                      {data.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <h6 className="fw-semibold mb-1">{data.title}</h6>

                          <p className="mb-1 text-muted">
                            {sender?.username && (
                              <span className="fw-semibold text-dark">
                                {sender.username}{" "}
                              </span>
                            )}
                            {data.text.replace(
                              `${sender?.username || "A user"} `,
                              "",
                            )}
                          </p>

                          <small className="text-muted">
                            {new Date(notification.created_at).toLocaleString()}
                          </small>
                        </div>

                        {!notification.isRead && (
                          <span
                            className="bg-primary rounded-circle flex-shrink-0"
                            style={{
                              width: "9px",
                              height: "9px",
                              marginTop: "6px",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
