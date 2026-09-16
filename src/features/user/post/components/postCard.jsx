import { Globe, Users } from "react-feather";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PostActions from "./postAction";
import CommentSection from "./commentSection";
import { getAvatarUrl } from "../../../../services/profileImageServices";

const PostCard = ({ post, currentUser, onLike, onSave, onComment }) => {
  const navigate = useNavigate();
  const profile = post?.profiles;
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const handleProfileNavigation = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <button
            type="button"
            className="btn btn-light border-0 d-flex align-items-center text-start p-0 flex-grow-1 bg-transparent"
            onClick={() => handleProfileNavigation(profile.id)}
          >
            <img
              src={profile?.profileImage || getAvatarUrl(profile)}
              alt={profile?.username}
              className="rounded-circle me-2"
              width="40"
              height="40"
            />

            <div>
              <h6 className="mb-0">{profile?.username}</h6>

              <small className="text-muted d-flex align-items-center gap-1">
                {new Date(post.created_at).toLocaleString()}
                {" · "}

                {post.visibility === "public" ? (
                  <Globe size={13} />
                ) : (
                  <Users size={13} />
                )}

                {post.visibility}
              </small>
            </div>
          </button>
        </div>

        {post.content && <p className="mb-3">{post.content}</p>}

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="img-fluid rounded mb-3 w-100"
          />
        )}

        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>{post.likeCount || 0} likes</span>
          <span>{post.commentCount || 0} comments</span>
        </div>

        <hr className="my-2" />

        <PostActions
          post={post}
          currentUser={currentUser}
          onLike={onLike}
          onSave={onSave}
          onCommentClick={() => setShowCommentsModal(true)}
        />

        <CommentSection
          post={post}
          currentUser={currentUser}
          onComment={onComment}
          showCommentsModal={showCommentsModal}
          onOpenCommentsModal={() => setShowCommentsModal(true)}
          onCloseCommentsModal={() => setShowCommentsModal(false)}
        />
      </div>
    </div>
  );
};

export default PostCard;