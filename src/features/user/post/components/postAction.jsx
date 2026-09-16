import { useState } from "react";
import { ThumbsUp, MessageCircle, Share2, Bookmark } from "react-feather";

import {
  likePostService,
  unlikePostService,
  savePostService,
  unsavePostService,
} from "../services/postServices";

const PostActions = ({ post, currentUser, onLike, onSave, onCommentClick }) => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleLike = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      if (post.likedByMe) {
        await unlikePostService(post.id, currentUser.id);
        onLike(post.id, false);
      } else {
        await likePostService(post.id, currentUser.id);
        onLike(post.id, true);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      showToast("Failed to update like.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saveLoading) {
      return;
    }

    try {
      setSaveLoading(true);

      if (post.savedByMe) {
        await unsavePostService(post.id, currentUser.id);
        onSave(post.id, false);
        showToast("Post removed from saved posts.");
      } else {
        await savePostService(post.id, currentUser.id);
        onSave(post.id, true);
        showToast("Post saved successfully.");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      showToast("Failed to save post.", "danger");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Post",
          text: post.content || "Check out this post",
          url: postUrl,
        });

        showToast("Post shared successfully.");
      } else {
        await navigator.clipboard.writeText(postUrl);
        showToast("Post link copied!");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing post:", error);
        showToast("Failed to share post.", "danger");
      }
    }
  };

  return (
    <>
      <div className="d-flex">
        {/* Like */}
        <button
          type="button"
          className={`btn flex-grow-1 ${
            post.likedByMe ? "text-primary" : "text-secondary"
          }`}
          onClick={handleLike}
          disabled={loading}
        >
          <ThumbsUp
            size={18}
            className="me-2"
            fill={post.likedByMe ? "currentColor" : "none"}
          />
          Like
        </button>

        {/* Comment */}
        <button
          type="button"
          className="btn text-secondary flex-grow-1"
          onClick={onCommentClick}
        >
          <MessageCircle size={18} className="me-2" />
          Comment
        </button>

        {/* Share */}
        <button
          type="button"
          className="btn text-secondary flex-grow-1"
          onClick={handleShare}
        >
          <Share2 size={18} className="me-2" />
          Share
        </button>

        {/* Save */}
        <button
          type="button"
          className={`btn flex-grow-1 ${
            post.savedByMe ? "text-primary" : "text-secondary"
          }`}
          onClick={handleSave}
          disabled={saveLoading}
        >
          <Bookmark
            size={18}
            className="me-2"
            fill={post.savedByMe ? "currentColor" : "none"}
          />
          Save
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="toast show position-fixed bottom-0 end-0 m-3 border-0 shadow-sm"
          role="alert"
          style={{
            zIndex: 1055,
            minWidth: "280px",
            backgroundColor: toast.type === "danger" ? "#f8d7da" : "#d1e7dd",
          }}
        >
          <div className="d-flex align-items-center p-3">
            <div
              className="toast-body p-0 fw-semibold"
              style={{
                color: toast.type === "danger" ? "#842029" : "#0f5132",
              }}
            >
              {toast.message}
            </div>

            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => setToast(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostActions;
