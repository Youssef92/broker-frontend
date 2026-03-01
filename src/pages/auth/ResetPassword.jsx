import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { resetPasswordSchema } from "../../validation/resetPasswordSchema";
import { resetPassword } from "../../services/authService";
import logo from "../../assets/logo.png";

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await resetPassword({
        email,
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (result.succeeded) {
        toast.success("Password reset successfully!");
        navigate("/login");
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

  const getPasswordBorderColor = (fieldName) => {
    if (errors[fieldName]) return "border-red-500";
    if (touchedFields[fieldName]) return "border-green-500";
    return "border-[#e7b965]";
  };

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen w-full">
      <div className="w-full md:w-1/2 bg-[#efe3cd] flex items-center justify-center">
        <div>
          <img src={logo} alt="" className="w-[100px] md:w-[250px]" />
          <p className="flex justify-center text-2xl md:text-5xl mb-10">
            AquaKeys
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-[#f0eff0]" />

      <div className="absolute top-[18%] left-[50%] -translate-x-1/2 md:top-[10%] md:left-[45%] md:-translate-x-0 flex items-center justify-center">
        <div className="bg-white w-[300px] md:w-[400px] rounded-2xl shadow-xl px-8 py-6">
          <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
          <p className="text-sm text-[#949494] mb-6">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-[#949494]">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("newPassword")}
                  className={`border p-2 w-full rounded transition-all duration-200 pr-10 ${getPasswordBorderColor("newPassword")}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`border p-2 w-full rounded transition-all duration-200 pr-10 ${getPasswordBorderColor("confirmPassword")}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white px-4 py-2 rounded transition-all duration-200 ${
                loading ? "bg-[#c1aa77]/50 cursor-not-allowed" : "bg-[#c1aa77]"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
