import { useState } from "react";
import { Heart, X } from "react-feather";

import {
  addCommentService,
  likeCommentService,
  unlikeCommentService,
} from "../services/postServices";
import { getAvatarUrl } from "../../../../services/profileImageServices";

const Comment = ({
  comment,
  comments,
  currentUser,
  onComment,
  showReplies = true,
}) => {
  const [reply, setReply] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(comment.likedByMe);

  const username = comment.profiles?.username || "User";

  const replies = comments.filter((item) => item.parentId === comment.id);

  const visibleReplies = showAllReplies ? replies : replies.slice(0, 2);

  const handleLikeUnlike = async () => {
    if (!currentUser || liking) {
      return;
    }

    try {
      setLiking(true);

      if (liked) {
        await unlikeCommentService(comment.id, currentUser.id);
        setLiked(false);
      } else {
        await likeCommentService(comment.id, currentUser.id);
        setLiked(true);
      }
    } catch (error) {
      console.error("Error updating comment like:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleReply = async (event) => {
    event.preventDefault();

    const content = reply.trim();

    if (!content || submitting || !currentUser) {
      return;
    }

    try {
      setSubmitting(true);

      await addCommentService({
        postId: comment.postId,
        userId: currentUser.id,
        content,
        parentId: comment.id,
      });

      setReply("");
      setShowReply(false);

      onComment?.();
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyChange = (event) => {
    setReply(event.currentTarget.innerText);
  };

  const renderContent = () => {
    const mention = `@${username}`;

    if (!comment.content.startsWith(mention)) {
      return comment.content;
    }

    return (
      <>
        <span className="text-primary">{mention}</span>
        {comment.content.slice(mention.length)}
      </>
    );
  };

  return (
    <div className="mb-3">
      <div className="d-flex gap-2">
        <img
          src={comment.profiles?.profileImage || getAvatarUrl(comment.profiles)}
          alt={username}
          width="34"
          height="34"
          className="rounded-circle flex-shrink-0 object-fit-cover"
        />

        <div>
          <div className="bg-light rounded-3 px-3 py-2">
            <div className="fw-semibold small">{username}</div>

            <div>{renderContent()}</div>

            <div className="d-flex gap-3 mt-1">
              <button
                type="button"
                className={`btn btn-sm p-0 ${
                  liked ? "text-primary" : "text-secondary"
                }`}
                onClick={handleLikeUnlike}
                disabled={liking}
              >
                <Heart
                  size={14}
                  className="me-1"
                  fill={liked ? "#0d6efd" : "none"}
                  color={liked ? "#0d6efd" : "#6c757d"}
                />
                Like
              </button>

              <button
                type="button"
                className="btn btn-sm p-0 text-primary"
                onClick={() => {
                  setShowReply(true);

                  if (!reply) {
                    setReply(`@${username} `);
                  }
                }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReply && (
        <form onSubmit={handleReply} className="d-flex gap-2 mt-2 ms-5">
          <div className="position-relative flex-grow-1">
            <div
              className="form-control form-control-sm rounded-pill pe-5"
              contentEditable={!submitting}
              suppressContentEditableWarning
              onInput={handleReplyChange}
              style={{
                minHeight: "31px",
                outline: "none",
              }}
            >
              <span className="text-primary">@{username}</span>{" "}
            </div>

            <button
              type="button"
              className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-1 p-1 text-secondary"
              onClick={() => {
                setReply("");
                setShowReply(false);
              }}
              disabled={submitting}
            >
              <X size={16} />
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-sm rounded-pill"
            disabled={submitting || !reply.trim()}
          >
            {submitting ? "..." : "Reply"}
          </button>
        </form>
      )}

      {showReplies && replies.length > 0 && (
        <div className="ms-5 mt-2">
          {visibleReplies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              comments={comments}
              currentUser={currentUser}
              onComment={onComment}
            />
          ))}

          {replies.length > 2 && (
            <button
              type="button"
              className="btn btn-sm p-0 text-primary"
              onClick={() => setShowAllReplies(!showAllReplies)}
            >
              {showAllReplies ? "Show less replies" : "Load more replies"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;
