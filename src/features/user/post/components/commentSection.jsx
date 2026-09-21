import { useEffect, useState } from "react";
import { Send, X } from "react-feather";

import {
  getCommentsService,
  addCommentService,
} from "../services/postServices";

import { getAvatarUrl } from "../../../../services/profileImageServices";
import { supabase } from "../../../../utils/supabase";
import { subscribeToPostCommentsServices } from "../services/postRealtimeService";

import Comment from "./comment";

const CommentSection = ({
  post,
  currentUser,
  onComment,
  showCommentsModal,
  onOpenCommentsModal,
  onCloseCommentsModal,
}) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    if (!post?.id) {
      return;
    }

    try {
      const data = await getCommentsService(post.id, currentUser?.id);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!post?.id) {
      return;
    }

    let channel;
    let isActive = true;

    const setupComments = async () => {
      await loadComments();

      if (!isActive) {
        return;
      }

      channel = subscribeToPostCommentsServices(post.id, async () => {
        try {
          const commentsData = await getCommentsService(
            post.id,
            currentUser?.id,
          );

          if (isActive) {
            setComments(commentsData);
          }
        } catch (error) {
          console.error("Error loading realtime comments:", error);
        }
      });
    };

    setupComments();

    return () => {
      isActive = false;

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [post?.id, currentUser?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedComment = comment.trim();

    if (!trimmedComment || submitting || !post?.id || !currentUser?.id) {
      return;
    }

    try {
      setSubmitting(true);

      await addCommentService({
        postId: post.id,
        userId: currentUser.id,
        content: trimmedComment,
        parentId: null,
      });

      setComment("");

      if (onComment) {
        onComment();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const topLevelComments = comments.filter((item) => item.parentId === null);

  const feedComments = topLevelComments.slice(0, 1);

  return (
    <div className="mt-2">
      {loading ? (
        <div className="text-center py-2">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {feedComments.map((item) => (
            <Comment
              key={item.id}
              comment={item}
              comments={comments}
              currentUser={currentUser}
              onComment={onComment}
              showReplies={false}
            />
          ))}

          {comments.length > 1 && (
            <button
              type="button"
              className="btn btn-sm p-0 text-primary mb-2"
              onClick={onOpenCommentsModal}
            >
              View all comments
            </button>
          )}
        </>
      )}

      {currentUser && (
        <form onSubmit={handleSubmit} className="d-flex gap-2 mt-2">
          <img
            src={currentUser.profileImage || getAvatarUrl(currentUser)}
            alt={currentUser.username || "User"}
            width="34"
            height="34"
            className="rounded-circle flex-shrink-0 object-fit-cover"
          />

          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Write a comment..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={submitting}
          />

          <button
            type="submit"
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
            disabled={submitting || !comment.trim()}
            style={{
              width: "40px",
              height: "40px",
            }}
          >
            {submitting ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <Send size={17} />
            )}
          </button>
        </form>
      )}

      {showCommentsModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-scrollable modal-lg">
              <div className="modal-content">
                {/* Modal header */}
                <div className="modal-header">
                  <h5 className="modal-title">Comments</h5>

                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={onCloseCommentsModal}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal body */}
                <div className="modal-body">
                  {topLevelComments.map((item) => (
                    <Comment
                      key={item.id}
                      comment={item}
                      comments={comments}
                      currentUser={currentUser}
                      onComment={onComment}
                      showReplies={true}
                    />
                  ))}

                  {/* Add new top-level comment */}
                  {currentUser && (
                    <form
                      onSubmit={handleSubmit}
                      className="d-flex gap-2 mt-3 pt-3 border-top"
                    >
                      <img
                        src={
                          currentUser.profileImage || getAvatarUrl(currentUser)
                        }
                        alt={currentUser.username || "User"}
                        width="34"
                        height="34"
                        className="rounded-circle flex-shrink-0 object-fit-cover"
                      />

                      <input
                        type="text"
                        className="form-control rounded-pill"
                        placeholder="Write a comment..."
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        disabled={submitting}
                      />

                      <button
                        type="submit"
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                        disabled={submitting || !comment.trim()}
                        style={{
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        {submitting ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <Send size={17} />
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal background */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
            onClick={onCloseCommentsModal}
          />
        </>
      )}
    </div>
  );
};

export default CommentSection;
