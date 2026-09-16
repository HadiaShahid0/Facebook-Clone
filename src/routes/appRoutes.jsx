import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./protectedRoutes";

import Login from "../features/auth/pages/login";
import Signup from "../features/auth/pages/signup";

import Home from "../features/user/post/pages/home";
import Friends from "../features/user/friends/pages/friends";
import Profile from "../features/user/profile/pages/profile";
import Notifications from "../features/user/notification/pages/notifications";
import Chat from "../features/user/chat/pages/chatPage";
import Post from "../features/user/post/components/singlePost";
import SavedPosts from "../features/user/post/components/savePost";
import BlockedUser from "../features/user/profile/components/blockedUser";
import AccountUnderReview from "../components/common/accountUnderReview";

import AdminLayout from "../features/admin/components/adminLayout";
import AdminDashboard from "../features/admin/pages/adminDashboard";
import ReportedUsers from "../features/admin/pages/reportedUsers";
import UserReports from "../features/admin/pages/userReports";
import SuspendedUsers from "../features/admin/pages/suspendedUsers";
// import AdminUsers from "../features/admin/pages/adminUsers";
// import AdminSettings from "../features/admin/pages/adminSetting";
const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/account-under-review" element={<AccountUnderReview />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/post/:postId" element={<Post />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/saved-posts" element={<SavedPosts />} />
        <Route path="/blocked-users" element={<BlockedUser />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/reported-users" element={<ReportedUsers />} />

          <Route path="/admin/user-reports/:userId" element={<UserReports />} />
          <Route path="/admin/suspended-users" element={<SuspendedUsers/>}/>
          {/* <Route path="/admin/users" element={<AdminUsers/>}/> */}
          {/* <Route path="/admin/settings" element={<AdminSettings/>}/> */}

        </Route>
      </Route>
    </Routes>
  );
};

export default App;
