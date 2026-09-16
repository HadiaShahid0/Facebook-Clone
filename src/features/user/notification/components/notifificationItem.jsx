import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { markNotificationReadService } from "../services/notificationServices";
import { getAvatarUrl } from "../../../../services/profileImageServices";

const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const sender = notification.profiles;

  const getNotificationText = () => {
    switch (notification.type) {
      case "friendRequest":
        return "Sent you a friend request.";

      case "friendRequestAccepted":
        return "Accepted your friend request.";

      case "friendRequestRejected":
        return "Rejected your friend request.";

      case "newPost":
        return "Created a new post.";

      case "like":
        return "Liked your post.";

      case "comment":
        return "Commented on your post.";

      case "likeComment":
        return "Liked your comment"

      case "message":
        return "sends a message"
      
      case "messageRequest":
        return "sends a message request"
      default:
        return "Sent you a notification.";
    }
  };
  
  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        setLoading(true);

        await markNotificationReadService(notification.id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      } finally {
        setLoading(false);
      }
    }

    if (notification.postId) {
      navigate(`/?post=${notification.postId}`);
    }
  };

  return (
    <div
      className={`p-3 border-bottom ${!notification.isRead ? "bg-light" : ""}`}
      onClick={handleClick}
      style={{
        cursor: "pointer",
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <img
          src={sender?.profileImage || getAvatarUrl(sender)}
          alt={sender?.username}
          width="45"
          height="45"
          className="rounded-circle object-fit-cover"
        />

        <div className="flex-grow-1">
          <div>
            <strong>{sender?.username || "Someone"}</strong>{" "}
            {getNotificationText()}
          </div>

          <small className="text-muted">
            {new Date(notification.created_at).toLocaleString()}
          </small>
        </div>

        {!notification.isRead && <span className="badge bg-primary">New</span>}
      </div>
    </div>
  );
};

export default NotificationItem;
