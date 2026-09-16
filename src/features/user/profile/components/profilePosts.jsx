import { useEffect, useState } from "react";
import PostCard from "../../post/components/postCard";
import { getUserPostsService } from "../../post/services/postServices";

const ProfilePosts = ({ userId, currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      setLoading(true);

      const data = await getUserPostsService(userId, currentUser?.id);

      setPosts(data);
    } catch (error) {
      console.error("Error loading user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && currentUser?.id) {
      loadPosts();
    }
  }, [userId, currentUser?.id]);

  const handleLike = (postId, liked) => {
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: liked,
              likeCount: liked
                ? (post.likeCount || 0) + 1
                : Math.max(0, (post.likeCount || 0) - 1),
            }
          : post,
      ),
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card border-0 shadow-sm p-4 text-center">
        <p className="text-muted mb-0">
          This user hasn't created any posts yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onLike={handleLike}
        />
      ))}
    </>
  );
};

export default ProfilePosts;
