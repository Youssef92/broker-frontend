import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../validation/registerSchema";
import { registerUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";
import { Eye, EyeOff } from "lucide-react";

const steps = [StepOne, StepTwo, StepThree];

function Register() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    shouldUnregister: false,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: 0,
      address: {
        country: "",
        city: "",
        street: "",
        state: "",
        zipCode: "",
      },
    },
  });

  const totalSteps = steps.length;
  const CurrentStep = steps[step - 1];

  const stepFields = [
    ["firstName", "lastName", "email", "phoneNumber"],
    [
      "address.country",
      "address.city",
      "address.street",
      "address.state",
      "address.zipCode",
    ],
    ["role", "password", "confirmPassword"],
  ];

  const variants = {
    enter: (direction) => ({
      x: direction === 1 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === 1 ? -100 : 100,
      opacity: 0,
    }),
  };

  const nextStep = async () => {
    const isValid = await methods.trigger(stepFields[step - 1]);

    if (!isValid) return;

    if (step < totalSteps) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await registerUser(data);

      if (result.succeeded) {
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        toast.error(result.message);
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
        <div className="bg-white w-[300px] md:w-[400px] rounded-2xl shadow-xl px-8 py-6 overflow-hidden">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {/* Progress Indicator */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      s <= step ? "bg-black" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                >
                  <CurrentStep
                    next={nextStep}
                    back={prevStep}
                    loading={loading}
                  />
                </motion.div>
              </AnimatePresence>
            </form>
          </FormProvider>
          <div className="mt-4 text-center text-sm">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepOne({ next }) {
  const {
    register,
    formState: { errors, touchedFields, isSubmitted },
    trigger,
    getValues,
  } = useFormContext();

  const fields = ["firstName", "lastName", "email", "phoneNumber"];

  const handleNext = async () => {
    const valid = await trigger(fields);
    if (valid) next();
  };

  return (
    <>
      <h2 className="text-xl mb-4">Personal Information</h2>

      {fields.map((field) => {
        const hasError = errors[field];
        const value = getValues(field);

        let borderColor = "border-[#e7b965]";
        if (hasError) borderColor = "border-red-500";
        else if ((touchedFields[field] || isSubmitted) && value)
          borderColor = "border-green-500";

        return (
          <div key={field} className="mb-3">
            <label className="block mb-1 text-sm font-medium capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type={field === "email" ? "email" : "text"}
              {...register(field)}
              className={`border p-2 w-full rounded transition-all duration-200 ${borderColor}`}
            />
            {hasError && (
              <p className="text-red-500 text-sm">{errors[field].message}</p>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleNext}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Next
      </button>
    </>
  );
}

function StepTwo({ next, back }) {
  const {
    register,
    formState: { errors, touchedFields, isSubmitted },
    trigger,
    getValues,
  } = useFormContext();

  const fields = ["country", "city", "street", "state", "zipCode"];

  const handleNext = async () => {
    const valid = await trigger(fields.map((f) => `address.${f}`));
    if (valid) next();
  };

  return (
    <>
      <h2 className="text-xl mb-4">Address Information</h2>

      {fields.map((field) => {
        const hasError = errors.address?.[field];
        const value = getValues(`address.${field}`);

        let borderColor = "border-[#e7b965]";
        if (hasError) borderColor = "border-red-500";
        else if ((touchedFields.address?.[field] || isSubmitted) && value)
          borderColor = "border-green-500";

        return (
          <div key={field} className="mb-3">
            <label className="block mb-1 text-sm font-medium capitalize">
              {field}
            </label>
            <input
              type="text"
              {...register(`address.${field}`)}
              className={`border p-2 w-full rounded transition-all duration-200 ${borderColor}`}
            />
            {hasError && (
              <p className="text-red-500 text-sm">
                {errors.address[field].message}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={back}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </>
  );
}

function StepThree({ back, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    formState: { errors, touchedFields },
  } = useFormContext();
  return (
    <>
      <h2 className="text-xl mb-4">Account Setup</h2>

      {/* Role */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Role</label>
        <div className="flex gap-6">
          {[
            { value: 0, label: "Client" },
            { value: 1, label: "Land Lord" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <input type="radio" value={option.value} {...register("role")} />
              {option.label}
            </label>
          ))}
        </div>
        {errors.role && (
          <p className="text-red-500 text-sm">{errors.role.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`border p-2 w-full rounded transition-all duration-200 pr-10 ${
              !touchedFields.password
                ? "border-[#e7b965]"
                : errors.password
                  ? "border-red-500"
                  : "border-green-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            className={`border p-2 w-full rounded transition-all duration-200 pr-10 ${
              !touchedFields.confirmPassword
                ? "border-[#e7b965]"
                : errors.confirmPassword
                  ? "border-red-500"
                  : "border-green-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={back}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`text-white px-4 py-2 rounded transition-all duration-200 ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600"
          }`}
        >
          {loading ? "Creating..." : "Submit"}
        </button>
      </div>
    </>
  );
}

export default Register;
