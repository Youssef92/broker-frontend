import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { getUserProfile } from "../../services/profileService";

function UserProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getUserProfile(userId);
        if (result.succeeded) {
          setProfile(result.data);
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
  }, [userId]);

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f0eff0]">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <p className="text-[#949494]">User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0eff0]">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm px-8 py-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#c1aa77]/20 flex items-center justify-center">
              <span className="text-3xl font-semibold text-[#c1aa77]">
                {profile.firstName?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <h2 className="text-center text-xl font-semibold mb-1">
            {profile.firstName} {profile.lastName}
          </h2>

          <div className="flex justify-center gap-2 mb-6">
            {profile.roles?.map((role) => (
              <span
                key={role}
                className="text-xs bg-[#c1aa77]/10 text-[#c1aa77] px-3 py-1 rounded-full"
              >
                {role}
              </span>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-[#949494] mb-4">
              Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#949494] mb-1">Country</p>
                <p className="text-sm font-medium">{profile.country || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#949494] mb-1">City</p>
                <p className="text-sm font-medium">{profile.city || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
