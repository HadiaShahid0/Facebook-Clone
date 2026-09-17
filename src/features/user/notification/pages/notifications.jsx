import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../../../utils/supabase";

import Navbar from "../../../../components/layout/navbar";
import Sidebar from "../../../../components/layout/sidebar";

import NotificationList from "../components/notificationList";

import { getCurrentUserService } from "../../../auth/services/authServices";

import {
  getNotificationsService,
  getNotificationByIdService,
  markAllNotificationsReadService,
} from "../services/notificationServices";

import { subscribeToNotificationChanges } from "../services/notificationReatimeService";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  //For realtime
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

        setNotifications(data);
        setLoading(false);

        channel = subscribeToNotificationChanges(user.id, async (payload) => {
          const newNotification = payload.new;

          console.log("Realtime notification:", newNotification);

          try {
            const notification = await getNotificationByIdService(
              newNotification.id,
            );

            setNotifications((previousNotifications) => {
              const alreadyExists = previousNotifications.some(
                (item) => item.id === notification.id,
              );

              if (alreadyExists) {
                return previousNotifications;
              }

              return [notification, ...previousNotifications];
            });
          } catch (error) {
            console.error("Error loading new notification:", error);
          }
        });
      } catch (error) {
        console.error("Error setting up notifications:", error);
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

  const markAllAsRead = async () => {
    try {
      const user = await getCurrentUserService();

      if (!user) {
        navigate("/login");
        return;
      }

      await markAllNotificationsReadService(user.id);

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container-fluid">
        <div className="row">
          <aside className="col-md-3 col-lg-3 desktop-sidebar">
            <Sidebar />
          </aside>

          <main className="col-12 col-md-9 col-lg-9 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Notifications</h2>

              {notifications.some((notification) => !notification.isRead) && (
                <button
                  className="btn btn-outline-primary"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    No notifications yet.
                  </div>
                ) : (
                  <NotificationList notifications={notifications} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Notifications;
