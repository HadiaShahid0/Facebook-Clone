import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "react-feather";

import PostCard from "../components/postCard";
import { getSinglePostService } from "../services/postServices";

import Navbar from "../../../../components/layout/navbar";
import Sidebar from "../../../../components/layout/sidebar";
import RightSidebar from "../../../../components/layout/rightSidebar";

const SinglePost = () => {
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getSinglePostService(postId);
        setPost(data);
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

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
          {/* Left Sidebar */}
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

          {/* Main Content */}
          <div className="col-12 col-lg-6 py-4">
            <div className="mx-auto" style={{ maxWidth: "650px" }}>
              <div className="d-flex align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1">Post</h4>
                  <small className="text-muted">
                    View this post
                  </small>
                </div>
              </div>

              {loading && (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4 text-center">
                    <div
                      className="spinner-border text-primary mb-3"
                      role="status"
                    />

                    <p className="text-muted mb-0">
                      Loading post...
                    </p>
                  </div>
                </div>
              )}

              {!loading && !post && (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body text-center p-5">
                    <h5 className="fw-bold">
                      Post not found
                    </h5>

                    <p className="text-muted mb-0">
                      This post may have been deleted or is no longer
                      available.
                    </p>
                  </div>
                </div>
              )}

              {!loading && post && (
                    <PostCard post={post} />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
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

export default SinglePost;
