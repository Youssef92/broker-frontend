import { Routes, Route } from "react-router-dom";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import ForgetPassword from "../pages/auth/ForgetPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ConfirmEmail from "../pages/auth/ConfirmEmail";
import ResendConfirmation from "../pages/auth/ResendConfirmation";
import MyProfile from "../pages/profile/MyProfile";
import UserProfile from "../pages/profile/UserProfile";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Home from "../pages/home/Home";
import CreateListing from "../pages/landlord/CreateListing";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/resend-confirmation" element={<ResendConfirmation />} />
      <Route path="/profile" element={<MyProfile />} />
      <Route
        path="/user/:userId"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-listing"
        element={
          // <ProtectedRoute>
          <CreateListing />
          // </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
