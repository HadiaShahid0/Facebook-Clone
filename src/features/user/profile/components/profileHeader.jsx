import { useRef, useState } from "react";
import {
  Camera,
  Edit,
  MessageCircle,
  Slash,
  MoreHorizontal,
} from "react-feather";
import { useNavigate } from "react-router-dom";

import ProfilePicture from "./profilePicture";

import {
  updateProfileService,
  uploadCoverImageService,
  blockUserService,
} from "../services/profileServices";

const ProfileHeader = ({
  user,
  currentUser,
  isOwnProfile,
  friendStatus,
  friendLoading,
  onAddFriend,
  onAcceptFriend,
  onDeleteFriendRequest,
  onUpdateProfile,
  onReportUser,
}) => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState(user.username);

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [blocking, setBlocking] = useState(false);

  const coverInputRef = useRef(null);

  const handleSave = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      return;
    }

    try {
      setSaving(true);

      const updatedProfile = await updateProfileService(user.id, {
        username: trimmedUsername,
      });

      onUpdateProfile(updatedProfile);

      setShowModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingCover(true);

      const coverImageUrl = await uploadCoverImageService(user.id, file);

      const updatedProfile = await updateProfileService(user.id, {
        coverImage: coverImageUrl,
      });

      onUpdateProfile(updatedProfile);
    } catch (error) {
      console.error("Error uploading cover image:", error);
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  };

  const handleMessage = () => {
    navigate(`/chat/${user.id}`);
  };

  const handleBlock = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to block ${user.username}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setBlocking(true);

      await blockUserService(currentUser.id, user.id);

      navigate("/");
    } catch (error) {
      console.error("Error blocking user:", error);
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div>
      <div
        className="position-relative bg-secondary rounded-top overflow-hidden"
        style={{ height: "220px" }}
      >
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-100 h-100"
            style={{
              objectFit: "cover",
            }}
          />
        )}

        {isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleCoverChange}
            />

            <button
              type="button"
              className="btn btn-light position-absolute bottom-0 end-0 m-3 fw-semibold"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
            >
              {uploadingCover ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera size={17} className="me-2" />
                  Add Cover Photo
                </>
              )}
            </button>
          </>
        )}
      </div>

      <div className="position-relative px-4 pb-4">
        <div
          className="position-absolute"
          style={{
            top: "-80px",
            left: "30px",
            zIndex: 2,
          }}
        >
          <ProfilePicture
            user={user}
            isOwnProfile={isOwnProfile}
            onUpdateProfile={onUpdateProfile}
          />
        </div>

        <div
          className="d-flex justify-content-between align-items-center flex-wrap gap-3"
          style={{
            paddingTop: "90px",
          }}
        >
          <div>
            <h2 className="fw-bold mb-1">{user.username}</h2>

            <p className="text-muted mb-0">@{user.username}</p>
          </div>

          <div className="d-flex gap-2">
            {/* Edit Profile */}
            {isOwnProfile && (
              <button
                type="button"
                className="btn btn-light border fw-semibold"
                onClick={() => {
                  setUsername(user.username);
                  setShowModal(true);
                }}
              >
                <Edit size={17} className="me-2" />
                Edit Profile
              </button>
            )}

            {/* Message */}
            {!isOwnProfile && (
              <button
                type="button"
                className="btn btn-light border fw-semibold"
                onClick={handleMessage}
              >
                <MessageCircle size={17} className="me-2" />
                Message
              </button>
            )}

            {/* Add Friend */}
            {!isOwnProfile && friendStatus === "none" && (
              <button
                type="button"
                className="btn btn-primary fw-semibold"
                onClick={onAddFriend}
                disabled={friendLoading}
              >
                {friendLoading ? "Sending..." : "Add Friend"}
              </button>
            )}

            {/* Sent Request */}
            {!isOwnProfile && friendStatus === "sent" && (
              <button
                type="button"
                className="btn btn-light border fw-semibold"
                onClick={onDeleteFriendRequest}
                disabled={friendLoading}
              >
                {friendLoading ? "Cancelling..." : "Request Sent"}
              </button>
            )}

            {/* Received Request */}
            {!isOwnProfile && friendStatus === "received" && (
              <>
                <button
                  type="button"
                  className="btn btn-primary fw-semibold"
                  onClick={onAcceptFriend}
                  disabled={friendLoading}
                >
                  {friendLoading ? "Accepting..." : "Accept"}
                </button>

                <button
                  type="button"
                  className="btn btn-light border fw-semibold"
                  onClick={onDeleteFriendRequest}
                  disabled={friendLoading}
                >
                  Reject
                </button>
              </>
            )}

            {/* Friends */}
            {!isOwnProfile && friendStatus === "friends" && (
              <button
                type="button"
                className="btn btn-light border fw-semibold"
                disabled
              >
                Friends
              </button>
            )}
            {/* {!isOwnProfile && (
             
            )} */}
            {!isOwnProfile && (
              <div className="dropdown">
                <button
                  className="btn btn-light rounded-circle"
                  data-bs-toggle="dropdown"
                >
                  <MoreHorizontal size={20} />
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button
                      type="button"
                      className="dropdown-item text-dark"
                      onClick={handleBlock}
                      disabled={blocking}
                    >
                      <Slash size={17} className="me-2" />

                      {blocking ? "Blocking..." : "Block"}
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={onReportUser}
                    >
                      Report profile
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Profile</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">Username</label>

                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoFocus
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving || !username.trim()}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOwnProfile && showModal && (
        <div className="modal-backdrop fade show" />
      )}
    </div>
  );
};

export default ProfileHeader;
