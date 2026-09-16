import { useRef, useState } from "react";
import { Image, Globe, Users, X, Send } from "react-feather";
import {
  createPostService,
  uploadPostImageService,
} from "../services/postServices";
import { getAvatarUrl } from "../../../../services/profileImageServices";

const CreatePost = ({ currentUser, onCreatePost }) => {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setContent("");
    setPrivacy("public");
    setImageFile(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent && !imageFile) {
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = null;

      if (imageFile) {
        imageUrl = await uploadPostImageService(currentUser.id, imageFile);
      }

      const newPost = await createPostService({
        userId: currentUser.id,
        content: trimmedContent || null,
        imageUrl,
        postVisibility: privacy,
      });

      const postWithUser = {
        ...newPost,
        profiles: currentUser,
      };
      onCreatePost(postWithUser);

      closeModal();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body p-3">
          <div className="d-flex align-items-center gap-2">
            <img
              src={currentUser.profileImage || getAvatarUrl(currentUser)}
              alt={currentUser.username}
              width="45"
              height="45"
              className="rounded-circle object-fit-cover"
            />

            <button
              type="button"
              className="btn btn-light text-secondary text-start rounded-pill flex-grow-1 py-2 px-3"
              onClick={openModal}
            >
              What's on your mind, {currentUser.username}?
            </button>
          </div>

          <hr className="my-3" />

          <div className="d-flex justify-content-around">
            <button
              type="button"
              className="btn btn-light text-success rounded-3"
              onClick={openModal}
            >
              <Image size={20} className="me-2" />
              Photo
            </button>

            <button
              type="button"
              className="btn btn-light text-primary rounded-3"
              onClick={openModal}
            >
              <Globe size={20} className="me-2" />
              Post
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "650px" }}
            >
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-bottom px-4 py-3">
                  <h5 className="modal-title fw-bold">Create post</h5>

                  <button
                    type="button"
                    className="btn btn-light rounded-circle p-2"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body px-4">
                    {/* User */}
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={
                          currentUser.profileImage || getAvatarUrl(currentUser)
                        }
                        alt={currentUser.username}
                        width="45"
                        height="45"
                        className="rounded-circle me-2 object-fit-cover"
                      />

                      <div>
                        <div className="fw-semibold">
                          {currentUser.username}
                        </div>

                        <div className="dropdown">
                          <button
                            type="button"
                            className="btn btn-light btn-sm dropdown-toggle d-flex align-items-center"
                            data-bs-toggle="dropdown"
                          >
                            {privacy === "public" ? (
                              <>
                                <Globe size={16} className="me-2" />
                                Public
                              </>
                            ) : (
                              <>
                                <Users size={16} className="me-2" />
                                Friends
                              </>
                            )}
                          </button>

                          <ul className="dropdown-menu">
                            <li>
                              <button
                                type="button"
                                className="dropdown-item d-flex align-items-center"
                                onClick={() => setPrivacy("public")}
                              >
                                <Globe size={18} className="me-2" />
                                public
                              </button>
                            </li>

                            <li>
                              <button
                                type="button"
                                className="dropdown-item d-flex align-items-center"
                                onClick={() => setPrivacy("friends")}
                              >
                                <Users size={18} className="me-2" />
                                Friends
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <textarea
                      className="form-control border-0 shadow-none fs-5"
                      rows="5"
                      placeholder={`What's on your mind, ${currentUser.username}?`}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      autoFocus
                    />

                    {imagePreview && (
                      <div className="position-relative mt-3">
                        <img
                          src={imagePreview}
                          alt="Post preview"
                          className="img-fluid rounded-3 w-100"
                        />

                        <button
                          type="button"
                          className="btn btn-dark rounded-circle position-absolute top-0 end-0 m-2 p-2"
                          onClick={handleRemoveImage}
                          disabled={submitting}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}

                    <div className="border rounded-3 p-3 mt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">Add to your post</span>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={handleImageChange}
                        />

                        <button
                          type="button"
                          className="btn btn-light rounded-circle p-2 text-success"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={submitting}
                        >
                          <Image size={22} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-top px-4 py-3">
                    <button
                      type="button"
                      className="btn btn-light rounded-3"
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 flex-grow-1"
                      disabled={submitting || (!content.trim() && !imageFile)}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send size={17} className="me-2" />
                          Post
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
};

export default CreatePost;
