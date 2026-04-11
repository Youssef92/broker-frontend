import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { getCheckoutStatus } from "../../services/paymentService";
import { CheckCircle, XCircle } from "lucide-react";

function CheckoutResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const providerRef = searchParams.get("orderRef");

  const [status, setStatus] = useState(providerRef ? "loading" : "failed");
  const [message, setMessage] = useState(
    providerRef ? "" : "Invalid checkout reference.",
  );

  useEffect(() => {
    if (!providerRef) return;

    const fetchStatus = async () => {
      try {
        const result = await getCheckoutStatus(providerRef);
        console.log("checkout status result:", result);
        if (result.succeeded) {
          setStatus("success");
          setMessage(
            result.message || "Your payment was completed successfully.",
          );
        } else {
          setStatus("failed");
          setMessage(result.message || "Payment could not be completed.");
        }
      } catch (err) {
        setStatus("failed");
        setMessage(err.response?.data?.message || "Something went wrong.");
      }
    };

    fetchStatus();
  }, [providerRef]);

  return (
    <div className="min-h-screen font-jost relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/85 via-[#0d0d0d]/75 to-[#0d0d0d]/95" />

      <div className="relative z-10">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-8">
          <div className="bg-[#1a1a1a]/60 border border-[#c1aa77]/20 p-12 max-w-md w-full text-center">
            {status === "loading" && (
              <>
                <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-3">
                  Please Wait
                </p>
                <h1 className="font-cormorant text-4xl text-[var(--cream)] font-light mb-3">
                  Verifying Payment...
                </h1>
                <p className="text-[#f5f0e8]/40 text-sm tracking-wide">
                  Checking your payment status.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle
                  size={48}
                  className="text-green-400 mx-auto mb-6"
                />
                <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-3">
                  Success
                </p>
                <h1 className="font-cormorant text-4xl text-[var(--cream)] font-light mb-3">
                  Payment Successful
                </h1>
                <p className="text-[#f5f0e8]/40 text-sm tracking-wide mb-8">
                  {message}
                </p>
                <button
                  onClick={() => navigate("/payment-methods")}
                  className="border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark)] px-8 py-3 text-xs tracking-[3px] uppercase transition-all duration-300"
                >
                  View Payment Methods
                </button>
              </>
            )}

            {status === "failed" && (
              <>
                <XCircle size={48} className="text-red-400 mx-auto mb-6" />
                <p className="text-[10px] tracking-[5px] uppercase text-red-400 mb-3">
                  Failed
                </p>
                <h1 className="font-cormorant text-4xl text-[var(--cream)] font-light mb-3">
                  Payment Failed
                </h1>
                <p className="text-[#f5f0e8]/40 text-sm tracking-wide mb-8">
                  {message}
                </p>
                <button
                  onClick={() => navigate("/payment-methods")}
                  className="border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark)] px-8 py-3 text-xs tracking-[3px] uppercase transition-all duration-300"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutResult;
