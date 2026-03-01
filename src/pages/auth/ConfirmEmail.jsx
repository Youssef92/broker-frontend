import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmEmail } from "../../services/authService";
import logo from "../../assets/logo.png";

function ConfirmEmail() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("UserId");
  const token = searchParams.get("Token");
  const clientId = searchParams.get("ClientId");

  useEffect(() => {
    const verify = async () => {
      try {
        await confirmEmail({ userId, token, clientId });
        setStatus("success");
        setMessage("Your email has been confirmed successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Something went wrong, please try again.",
        );
      }
    };

    verify();
  }, []);

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
        <div className="bg-white w-[300px] md:w-[400px] rounded-2xl shadow-xl px-8 py-10 text-center">
          {status === "loading" && (
            <p className="text-[#949494]">Confirming your email...</p>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-500 text-3xl">✓</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Email Confirmed!</h2>
              <p className="text-[#949494] text-sm mb-6">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#c1aa77] text-white py-2 rounded transition-all duration-200 hover:bg-[#c1aa77]/80"
              >
                Go to Login
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-3xl">✕</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Confirmation Failed
              </h2>
              <p className="text-[#949494] text-sm mb-6">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#c1aa77] text-white py-2 rounded transition-all duration-200 hover:bg-[#c1aa77]/80"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmEmail;
