import { useEffect, useState } from "react";
import { UserX } from "react-feather";

import Navbar from "../../../../components/layout/navbar";
import Sidebar from "../../../../components/layout/sidebar";
import { getCurrentUserService } from "../../../auth/services/authServices";

import {
  getBlockedUsersService,
  unblockUserService,
} from "../services/profileServices";

import { getAvatarUrl } from "../../../../services/profileImageServices";

const BlockedUser = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingUserId, setUnblockingUserId] = useState(null);

  const loadBlockedUsers = async () => {
    try {
      const currentUser = await getCurrentUserService();

      const users = await getBlockedUsersService(currentUser.id);

      setBlockedUsers(users || []);
    } catch (error) {
      console.error("Error loading blocked users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const handleUnblock = async (blockedUserId) => {
    try {
      const currentUser = await getCurrentUserService();

      setUnblockingUserId(blockedUserId);

      await unblockUserService(currentUser.id, blockedUserId);

      setBlockedUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== blockedUserId),
      );
    } catch (error) {
      console.error("Error unblocking user:", error);
    } finally {
      setUnblockingUserId(null);
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">sssss
                <h4 className="mb-4">Blocked Users</h4>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <UserX size={40} />

                    <p className="mt-2 mb-0">You have not blocked anyone.</p>
                  </div>
                ) : (
                  blockedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="d-flex align-items-center justify-content-between py-3 border-bottom"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={user.profileImage || getAvatarUrl(user.username)}
                          alt={user.username}
                          width="50"
                          height="50"
                          className="rounded-circle object-fit-cover"
                        />

                        <div className="ms-3">
                          <h6 className="mb-0">{user.username}</h6>
                        </div>
                      </div>

                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleUnblock(user.id)}
                        disabled={unblockingUserId === user.id}
                      >
                        {unblockingUserId === user.id
                          ? "Unblocking..."
                          : "Unblock"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlockedUser;
