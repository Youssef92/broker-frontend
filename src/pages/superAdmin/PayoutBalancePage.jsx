import { useState, useEffect } from "react";
import { Wallet, TrendingDown } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { getPayoutBalance } from "../../services/superAdminService";

export default function PayoutBalancePage() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      try {
        const result = await getPayoutBalance();
        if (result.succeeded) {
          setBalance(result.data);
        } else {
          toast.error(result.message || "Failed to load balance.");
        }
      } catch {
        toast.error("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(13,13,13,0.6) 0%, rgba(13,13,13,0.7) 50%, rgba(13,13,13,8) 100%), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="relative w-full h-52 rounded-3xl overflow-hidden mb-10">
            <img
              src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1800&q=80"
              alt="Payout Balance"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <h1
                className="text-5xl font-semibold text-white"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                Payout Balance
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : balance ? (
            <div className="flex flex-col gap-4">
              {/* Main Balance Card */}
              <div className="bg-[var(--dark-2)] border border-white/5 rounded-2xl p-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
                  <Wallet size={28} className="text-[var(--gold)]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs tracking-[3px] uppercase mb-2">
                    Available Balance
                  </p>
                  <p
                    className="text-5xl font-semibold text-[var(--gold)]"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {balance.amount?.toLocaleString()}
                    <span className="text-2xl text-white/40 ml-2 font-normal">
                      {balance.currency}
                    </span>
                  </p>
                </div>
              </div>

              {/* Low Balance Warning */}
              {balance.isLowBalance && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-4">
                  <TrendingDown size={20} className="text-red-400 shrink-0" />
                  <div>
                    <p className="text-red-400 text-sm font-medium mb-0.5">
                      Low Balance Warning
                    </p>
                    <p className="text-red-400/60 text-xs">
                      Platform payout balance is running low. Consider topping
                      up.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Wallet size={48} className="text-white/10 mb-4" />
              <p className="text-white/40 text-lg">No balance data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
