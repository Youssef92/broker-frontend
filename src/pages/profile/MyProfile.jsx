import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getMyProfile, updateMyProfile } from "../../services/profileService";
import { changePassword } from "../../services/authService";
import { updateProfileSchema } from "../../validation/updateProfileSchema";
import { changePasswordSchema } from "../../validation/changePasswordSchema";
import useAuth from "../../hooks/useAuth";

function MyProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { logout } = useAuth();

  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getMyProfile();
        if (result.succeeded) {
          profileForm.reset({
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            country: result.data.country,
            city: result.data.city,
            street: result.data.street || "",
            state: result.data.state,
            zipCode: result.data.zipCode,
          });
        } else {
          toast.error(result.message || "Failed to load profile.");
        }
      } catch (err) {
        const message = err.response?.data?.message;
        toast.error(message || "Something went wrong, please try again.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProfileSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await updateMyProfile(data);
      if (result.succeeded) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    } catch (err) {
      const message = err.response?.data?.message;
      toast.error(message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await changePassword(data);
      if (result.succeeded) {
        toast.success("Password changed successfully!");
        passwordForm.reset();
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    } catch (err) {
      const message = err.response?.data?.message;
      toast.error(message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#f0eff0]">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <p className="text-[#949494]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0eff0]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">My Account</h1>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-[#c1aa77] text-[#c1aa77]"
                : "text-[#949494] hover:text-[#c1aa77]"
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "password"
                ? "border-b-2 border-[#c1aa77] text-[#c1aa77]"
                : "text-[#949494] hover:text-[#c1aa77]"
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm px-8 py-6">
          {activeTab === "profile" ? (
            <ProfileTab
              profileForm={profileForm}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              loading={loading}
              onProfileSubmit={onProfileSubmit}
              logout={logout}
            />
          ) : (
            <PasswordTab
              passwordForm={passwordForm}
              loading={loading}
              onPasswordSubmit={onPasswordSubmit}
              showCurrentPassword={showCurrentPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({
  profileForm,
  isEditing,
  setIsEditing,
  loading,
  onProfileSubmit,
  logout,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    getValues,
    reset,
  } = profileForm;

  const getFieldBorderColor = (fieldName) => {
    const value = getValues(fieldName);
    if (errors[fieldName]) return "border-red-500";
    if (touchedFields[fieldName] && value) return "border-green-500";
    if (!isEditing) return "border-gray-200";
    return "border-[#e7b965]";
  };

  return (
    <form onSubmit={handleSubmit(onProfileSubmit)}>
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: "firstName", label: "First Name" },
          { name: "lastName", label: "Last Name" },
          { name: "country", label: "Country" },
          { name: "city", label: "City" },
          { name: "street", label: "Street" },
          { name: "state", label: "State" },
          { name: "zipCode", label: "Zip Code" },
        ].map(({ name, label }) => (
          <div key={name} className="mb-3">
            <label className="block mb-1 text-sm font-medium text-[#949494]">
              {label}
            </label>
            <input
              type="text"
              {...register(name)}
              disabled={!isEditing}
              className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor(name)} ${
                !isEditing ? "bg-gray-50 cursor-default" : "bg-white"
              }`}
            />
            {errors[name] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[name].message}
              </p>
            )}
          </div>
        ))}
      </div>

      {isEditing ? (
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 text-white py-2 rounded transition-all duration-200 ${
              loading ? "bg-[#c1aa77]/50 cursor-not-allowed" : "bg-[#c1aa77]"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setIsEditing(false);
            }}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded transition-all duration-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 bg-[#c1aa77] text-white py-2 rounded transition-all duration-200 hover:bg-[#c1aa77]/80"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex-1 bg-red-500 text-white py-2 rounded transition-all duration-200 hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </form>
  );
}
function PasswordTab({
  passwordForm,
  loading,
  onPasswordSubmit,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = passwordForm;

  const getPasswordBorderColor = (fieldName) => {
    if (errors[fieldName]) return "border-red-500";
    if (touchedFields[fieldName]) return "border-green-500";
    return "border-[#e7b965]";
  };

  return (
    <form onSubmit={handleSubmit(onPasswordSubmit)}>
      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium text-[#949494]">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showCurrentPassword ? "text" : "password"}
            {...register("currentPassword")}
            className={`border p-2 w-full rounded transition-all duration-200 pr-10 ${getPasswordBorderColor("currentPassword")}`}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium text-[#949494]">
          New Password
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            {...register("newPassword")}
            className={`border p-2 w-full rounded transition-all duration-200 pr-10 ${getPasswordBorderColor("newPassword")}`}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-[#949494]">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmNewPassword")}
            className={`border p-2 w-full rounded transition-all duration-200 pr-10 ${getPasswordBorderColor("confirmNewPassword")}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmNewPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full text-white py-2 rounded transition-all duration-200 ${
          loading ? "bg-[#c1aa77]/50 cursor-not-allowed" : "bg-[#c1aa77]"
        }`}
      >
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}
export default MyProfile;
