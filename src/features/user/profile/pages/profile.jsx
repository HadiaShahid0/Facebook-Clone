import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../../../components/layout/navbar";
import ProfileHeader from "../components/profileHeader";
import ProfilePosts from "../components/profilePosts";
import CreatePost from "../../post/components/createPost";

import { getCurrentUserService } from "../../../auth/services/authServices";

import {
  getProfileService,
  getBlockedUserIdsService,
  reportUserService,
} from "../services/profileServices";

import {
  getFriendStatusService,
  sendFriendRequestService,
  acceptFriendRequestService,
  deleteFriendRequestService,
} from "../../friends/services/friendServices";

const Profile = () => {
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [friendStatus, setFriendStatus] = useState("none");
  const [friendRequestId, setFriendRequestId] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState([]);

  const loadProfile = async () => {
    const resetProfile = () => {
      setUser(null);
      setFriendStatus("none");
      setFriendRequestId(null);
    };
    try {
      setLoading(true);

      const currentUserData = await getCurrentUserService();
      if (!currentUserData) return setUser(null);

      const currentUserProfile = await getProfileService(currentUserData.id);
      setCurrentUser(currentUserProfile);

      const profileId = userId || currentUserData.id;
      const isOwnProfile = String(profileId) === String(currentUserData.id);

      if (!isOwnProfile) {
        const blockedUserIds = await getBlockedUserIdsService(
          currentUserData.id,
        );

        if (blockedUserIds.some((id) => String(id) === String(profileId))) {
          return resetProfile();
        }
      }

      const profile = await getProfileService(profileId);

      if (!isOwnProfile && (profile.isAdmin || profile.isSuspended)) {
        return resetProfile();
      }

      setUser(profile);

      if (isOwnProfile) {
        setFriendStatus("own");
        return setFriendRequestId(null);
      }

      const friendship = await getFriendStatusService(
        currentUserData.id,
        profile.id,
      );

      setFriendStatus(friendship.status);
      setFriendRequestId(friendship.requestId);
    } catch (error) {
      console.error("Error loading profile:", error);
      resetProfile();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleUpdateProfile = (updatedData) => {
    setUser((previousUser) => ({
      ...previousUser,
      ...updatedData,
    }));
  };

  const handleCreatePost = (newPost) => {
    const post = {
      ...newPost,
      likeCount: 0,
      likedByMe: false,
      commentCount: 0,
    };

    setPosts((previousPosts) => [post, ...previousPosts]);
  };

  const handleAddFriend = async () => {
    try {
      setFriendLoading(true);

      const data = await sendFriendRequestService({
        senderId: currentUser.id,
        receiverId: user.id,
      });

      setFriendStatus("sent");
      setFriendRequestId(data.id);
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert(error.message);
    } finally {
      setFriendLoading(false);
    }
  };

  const handleAcceptFriend = async () => {
    try {
      setFriendLoading(true);

      await acceptFriendRequestService(friendRequestId, currentUser.id);

      setFriendStatus("friends");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert(error.message);
    } finally {
      setFriendLoading(false);
    }
  };

  const handleDeleteFriendRequest = async () => {
    try {
      setFriendLoading(true);

      await deleteFriendRequestService(friendRequestId);

      setFriendStatus("none");
      setFriendRequestId(null);
    } catch (error) {
      console.error("Error deleting friend request:", error);
      alert(error.message);
    } finally {
      setFriendLoading(false);
    }
  };

  const handleReportUser = async () => {
    if (!reportCategory || !reportReason) {
      alert("Please select a reason.");
      return;
    }

    try {
      setReportLoading(true);

      await reportUserService({
        reporterId: currentUser.id,
        reportedUserId: user.id,
        category: reportCategory,
        reason: reportReason,
        description: reportDescription,
      });

      alert("Thanks for reporting. We will review this profile.");

      setShowReportModal(false);
      setReportCategory("");
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      console.error("Error reporting user:", error);
      alert(error.message);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="container py-4">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />

        <main className="container py-4">
          <div className="text-center py-5">
            <h2>Profile unavailable</h2>
            <p className="text-muted">This profile is not available.</p>
          </div>
        </main>
      </>
    );
  }

  const isOwnProfile = friendStatus === "own";

  return (
    <>
      <Navbar />

      <main className="container py-4">
        <div className="card border-0 shadow-sm mb-4">
          <ProfileHeader
            user={user}
            currentUser={currentUser}
            isOwnProfile={isOwnProfile}
            friendStatus={friendStatus}
            friendLoading={friendLoading}
            onAddFriend={handleAddFriend}
            onAcceptFriend={handleAcceptFriend}
            onDeleteFriendRequest={handleDeleteFriendRequest}
            onUpdateProfile={handleUpdateProfile}
            onReportUser={() => setShowReportModal(true)}
          />
        </div>

        <div className="mx-auto" style={{ maxWidth: "680px" }}>
          <h4 className="fw-bold mb-3">
            {isOwnProfile ? "Your Posts" : `${user.username}'s Posts`}
          </h4>

          {/* Create Post */}
          {isOwnProfile && (
            <CreatePost currentUser={user} onCreatePost={handleCreatePost} />
          )}

          <ProfilePosts userId={user.id} currentUser={currentUser} />
        </div>
      </main>

      {showReportModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Report {user.username}</h5>

                <button
                  className="btn-close"
                  onClick={() => setShowReportModal(false)}
                />
              </div>

              <div className="modal-body">
                <p className="text-muted">
                  Why are you reporting this profile?
                </p>

                <label className="form-label fw-semibold">Category</label>

                <select
                  className="form-select mb-3"
                  value={reportCategory}
                  onChange={(e) => {
                    setReportCategory(e.target.value);
                    setReportReason("");
                  }}
                >
                  <option value="">Select category</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="fake_account">Fake account</option>
                  <option value="impersonation">Impersonation</option>
                  <option value="inappropriate_content">
                    Inappropriate content
                  </option>
                  <option value="scam">Scam or fraud</option>
                  <option value="other">Other</option>
                </select>

                {reportCategory && (
                  <>
                    <label className="form-label fw-semibold">Reason</label>

                    <select
                      className="form-select mb-3"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="">Select reason</option>

                      {reportCategory === "harassment" && (
                        <>
                          <option value="bullying">
                            Bullying or harassment
                          </option>
                          <option value="threats">
                            Threats or abusive behavior
                          </option>
                        </>
                      )}

                      {reportCategory === "fake_account" && (
                        <>
                          <option value="fake_profile">Fake profile</option>
                          <option value="spam_account">Spam account</option>
                        </>
                      )}

                      {reportCategory === "impersonation" && (
                        <>
                          <option value="pretending_to_be_someone">
                            Pretending to be someone else
                          </option>
                        </>
                      )}

                      {reportCategory === "inappropriate_content" && (
                        <>
                          <option value="offensive_content">
                            Offensive content
                          </option>
                          <option value="harmful_content">
                            Harmful content
                          </option>
                        </>
                      )}

                      {reportCategory === "scam" && (
                        <>
                          <option value="fraud">Fraud or scam</option>
                          <option value="suspicious_activity">
                            Suspicious activity
                          </option>
                        </>
                      )}

                      {reportCategory === "other" && (
                        <option value="other">Other reason</option>
                      )}
                    </select>
                  </>
                )}

                <label className="form-label fw-semibold">
                  Additional information
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Tell us more about this report..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                  disabled={reportLoading}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  onClick={handleReportUser}
                  disabled={reportLoading}
                >
                  {reportLoading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
