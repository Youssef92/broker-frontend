import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { paymentSchema } from "../../validation/paymentSchema";
import { addPaymentMethod } from "../../services/paymentService";
import logo from "../../assets/logo.png";

function Payment() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    getValues,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const getFieldBorderColor = (fieldName) => {
    const value = getValues(fieldName);
    if (errors[fieldName]) return "border-red-500";
    if (touchedFields[fieldName] && value) return "border-green-500";
    return "border-[#e7b965]";
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await addPaymentMethod(data);
      if (result.succeeded) {
        toast.success("Payment method added successfully!");
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

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen w-full">
      {/* Left Side */}
      <div className="w-full md:w-1/2 bg-[#efe3cd] flex items-center justify-center">
        <div>
          <img src={logo} alt="" className="w-[100px] md:w-[250px]" />
          <p className="flex justify-center text-2xl md:text-5xl mb-10">
            AquaKeys
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 bg-[#f0eff0]" />

      {/* Card */}
      <div className="absolute top-[5%] left-[50%] -translate-x-1/2 md:top-[5%] md:left-[45%] md:-translate-x-0 flex items-center justify-center">
        <div className="bg-white w-[300px] md:w-[450px] rounded-2xl shadow-xl px-8 py-6">
          <h2 className="text-xl font-semibold mb-1">Payment Details</h2>
          <p className="text-sm text-[#949494] mb-6">
            Please fill in your billing data
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-[#949494]">
                  First Name
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor("firstName")}`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-[#949494]">
                  Last Name
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor("lastName")}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-[#949494]">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor("email")}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-[#949494]">
                Phone Number
              </label>
              <input
                type="text"
                {...register("phoneNumber")}
                className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor("phoneNumber")}`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-[#949494]">
                  Country
                </label>
                <input
                  type="text"
                  {...register("country")}
                  className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor("country")}`}
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.country.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-[#949494]">
                  City
                </label>
                <input
                  type="text"
                  {...register("city")}
                  className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor("city")}`}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>

            {/* Street */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-[#949494]">
                Street Address
              </label>
              <input
                type="text"
                {...register("street")}
                className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor("street")}`}
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.street.message}
                </p>
              )}
            </div>

            {/* Zip Code */}
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-[#949494]">
                Zip Code
              </label>
              <input
                type="text"
                {...register("zipCode")}
                className={`border p-2 w-full rounded transition-all duration-200 ${getFieldBorderColor("zipCode")}`}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white px-4 py-2 rounded transition-all duration-200 ${
                loading
                  ? "bg-[#c1aa77]/50 cursor-not-allowed"
                  : "bg-[#c1aa77]"
              }`}
            >
              {loading ? "Processing..." : "Confirm & Pay Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Payment;