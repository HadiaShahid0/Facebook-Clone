import { useEffect, useState } from "react";
import { Bookmark } from "react-feather";

import Navbar from "../../../../components/layout/navbar";
import Sidebar from "../../../../components/layout/sidebar";
import RightSidebar from "../../../../components/layout/rightSidebar";

import PostCard from "./postCard";
import { getSavedPostsService } from "../services/postServices";
import { supabase } from "../../../../utils/supabase";

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedPosts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setCurrentUser(user);

        const savedPosts = await getSavedPostsService(user.id);

        setPosts(savedPosts);
      } catch (error) {
        console.error("Error loading saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedPosts();
  }, []);

  const handleSaveUnsave = (postId, saved) => {
    if (!saved) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    }
  };

  return (
    <>
      <Navbar />

      <div
        className="container-fluid bg-light"
        style={{
          minHeight: "calc(100vh - 56px)",
        }}
      >
        <div className="row">
          <div className="col-lg-3 d-none d-lg-block">
            <div
              className="position-sticky"
              style={{
                top: "70px",
                height: "calc(100vh - 80px)",
              }}
            >
              <Sidebar />
            </div>
          </div>

          <div className="col-12 col-lg-6 py-4">
            <div
              className="mx-auto"
              style={{
                maxWidth: "650px",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary me-3"
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                >
                  <Bookmark size={20} fill="currentColor" />
                </div>

                <h6 className="fw-bold mb-1">Saved Posts</h6>
                <div></div>
              </div>

              {loading && (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body text-center p-5">
                    <div
                      className="spinner-border text-primary mb-3"
                      role="status"
                    />

                    <p className="text-muted mb-0">Loading saved posts...</p>
                  </div>
                </div>
              )}

              {!loading && posts.length === 0 && (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body text-center p-5">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle bg-light mx-auto mb-3"
                      style={{
                        width: "70px",
                        height: "70px",
                      }}
                    >
                      <Bookmark size={32} className="text-secondary" />
                    </div>

                    <h5 className="fw-bold">No saved posts</h5>

                    <p className="text-muted mb-0">
                      When you save a post, you'll find it here.
                    </p>
                  </div>
                </div>
              )}

              {!loading &&
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onSaveUnsave={handleSaveUnsave}
                  />
                ))}
            </div>
          </div>

          <div className="col-lg-3 d-none d-lg-block">
            <div
              className="position-sticky"
              style={{
                top: "70px",
                height: "calc(100vh - 80px)",
              }}
            >
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedPosts;
