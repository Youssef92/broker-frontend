import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { resendConfirmationSchema } from "../../validation/resendConfirmationSchema";
import { resendConfirmation } from "../../services/authService";
import logo from "../../assets/logo.png";

function ResendConfirmation() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    getValues,
  } = useForm({
    resolver: zodResolver(resendConfirmationSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await resendConfirmation(data.email);
      if (result.succeeded) {
        setSent(true);
        toast.success("Confirmation email sent! Check your inbox.");
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

  const value = getValues("email");
  const hasError = errors.email;
  let borderColor = "border-[#e7b965]";
  if (hasError) borderColor = "border-red-500";
  else if (touchedFields.email && value) borderColor = "border-green-500";

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
          <h2 className="text-xl font-semibold mb-2">Resend Confirmation</h2>
          <p className="text-sm text-[#949494] mb-6">
            Enter your email and we'll resend the confirmation link.
          </p>

          {sent ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">
                Confirmation email sent! Check your inbox.
              </p>
              <Link
                to="/login"
                className="text-[#c1aa77] text-sm hover:underline"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-[#949494]">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`border p-2 w-full rounded transition-all duration-200 ${borderColor}`}
                />
                {hasError && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white px-4 py-2 rounded transition-all duration-200 ${
                  loading
                    ? "bg-[#c1aa77]/50 cursor-not-allowed"
                    : "bg-[#c1aa77]"
                }`}
              >
                {loading ? "Sending..." : "Resend Confirmation"}
              </button>

              <div className="mt-4 text-center text-sm">
                <Link to="/login" className="text-[#c1aa77] hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResendConfirmation;
