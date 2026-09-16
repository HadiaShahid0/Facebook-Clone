import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../../components/layout/navbar";
import Sidebar from "../../../../components/layout/sidebar";
import RightSidebar from "../../../../components/layout/rightSidebar";

import CreatePost from "../components/createPost";
import PostCard from "../components/postCard";

import { getCurrentUserService } from "../../../auth/services/authServices.js";
import {
  getProfileService,
  getBlockedUserIdsService,
} from "../../profile/services/profileServices.js";
import { getPostsService } from "../services/postServices";
import { supabase } from "../../../../utils/supabase";
import {
  subscribeToPostLikes,
  subscribeToNewPosts,
} from "../services/postRealtimeService";

const PAGE_SIZE = 10;

const Home = () => {
  const navigate = useNavigate();
  const observerRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  //realtime post like
  useEffect(() => {
    if (!currentUser) return;

    const channel = subscribeToPostLikes((change) => {
      if (change.userId === currentUser.id) {
        return;
      }

      setPosts((previousPosts) =>
        previousPosts.map((post) => {
          if (post.id !== change.postId) {
            return post;
          }

          return {
            ...post,
            likeCount: (post.likeCount || 0) + 1,
          };
        }),
      );
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  //Load users
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUserService();

        if (!user) {
          navigate("/login");
          return;
        }

        const profile = await getProfileService(user.id);

        setCurrentUser(profile);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [navigate]);

  // new post realtime
  useEffect(() => {
    if (!currentUser) return;

    const channel = subscribeToNewPosts(async (newPost) => {
      try {
        const blockedUserIds = await getBlockedUserIdsService(currentUser.id);

        if (blockedUserIds.includes(newPost.userId)) {
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, username, profileImage")
          .eq("id", newPost.userId)
          .single();

        if (error) {
          throw error;
        }

        const postWithProfile = {
          ...newPost,
          profiles: profile,
          likeCount: 0,
          commentCount: 0,
          likedByMe: false,
        };

        setPosts((previousPosts) => {
          const alreadyExists = previousPosts.some(
            (post) => post.id === postWithProfile.id,
          );

          if (alreadyExists) {
            return previousPosts;
          }

          return [postWithProfile, ...previousPosts];
        });
      } catch (error) {
        console.error("Error loading realtime post profile:", error);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const loadPosts = async (from = 0) => {
    if (!currentUser) return;

    try {
      const to = from + PAGE_SIZE - 1;

      const data = await getPostsService(currentUser.id, from, to);

      if (from === 0) {
        setPosts(data);
      } else {
        setPosts((previousPosts) => [...previousPosts, ...data]);
      }

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  // Load first posts after user is available
  useEffect(() => {
    if (!currentUser) return;

    const loadInitialPosts = async () => {
      try {
        setLoadingPosts(true);
        setHasMore(true);

        await loadPosts(0);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadInitialPosts();
  }, [currentUser]);

  // Load more posts
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore || !currentUser) {
      return;
    }

    try {
      setLoadingMore(true);

      await loadPosts(posts.length);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [currentUser, posts.length, loadingMore, hasMore]);

  // Add new post to the top
  const handleCreatePost = (newPost) => {
    const post = {
      ...newPost,
      likeCount: 0,
      likedByMe: false,
      commentCount: 0,
    };

    setPosts((previousPosts) => {
      const alreadyExists = previousPosts.some((item) => item.id === post.id);

      if (alreadyExists) {
        return previousPosts;
      }

      return [post, ...previousPosts];
    });
  };

  // Update like
  const handleLike = (postId, liked) => {
    setPosts((previousPosts) =>
      previousPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          likedByMe: liked,
          likeCount: liked
            ? (post.likeCount || 0) + 1
            : Math.max(0, (post.likeCount || 0) - 1),
        };
      }),
    );
  };

  // Update comment count
  const handleComment = (postId) => {
    setPosts((previousPosts) =>
      previousPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          commentCount: (post.commentCount || 0) + 1,
        };
      }),
    );
  };

  const handleSave = (postId, saved) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, savedByMe: saved } : post,
      ),
    );
  };

  if (loadingUser) {
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

  if (!currentUser) {
    return (
      <>
        <Navbar />

        <div className="container py-5">
          <div className="alert alert-warning">
            Please login to view the home page.
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

          <main className="col-12 col-md-6 col-lg-6 main-content py-3">
            <div className="feed-container mx-auto">
              <CreatePost
                currentUser={currentUser}
                onCreatePost={handleCreatePost}
              />
              {loadingPosts ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="card border-0 shadow-sm p-4 text-center">
                  <p className="text-muted mb-0">No posts yet.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                    onSave={handleSave}
                  />
                ))
              )}

              {loadingMore && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading more posts...
                    </span>
                  </div>
                </div>
              )}

              {hasMore && <div ref={observerRef} className="py-4" />}

              {!hasMore && posts.length > 0 && (
                <div className="text-center text-muted py-4">No more posts</div>
              )}
            </div>
          </main>

          <aside className="col-lg-3 d-none d-lg-block">
            <RightSidebar />
          </aside>
        </div>
      </div>
    </>
  );
};

export default Home;
