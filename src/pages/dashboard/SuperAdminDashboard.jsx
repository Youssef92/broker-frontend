import { useNavigate } from "react-router-dom";
import { Users, Shield, Settings, Wallet, ArrowRight } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import useAuth from "../../hooks/useAuth";

const HubCard = ({ icon, title, description, onClick }) => {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-6 rounded-2xl border border-white/5 bg-[var(--dark-2)] hover:border-[var(--gold)]/30 transition-all duration-300 group flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--gold)]/10">
        <Icon size={18} className="text-[var(--gold)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm mb-1 text-white"
          style={{ fontFamily: "Cormorant Garamond, serif" }}
        >
          {title}
        </p>
        <p className="text-xs leading-relaxed text-white/40">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="shrink-0 mt-1 text-[var(--gold)]/40 group-hover:text-[var(--gold)] transition-all duration-300 group-hover:translate-x-1"
      />
    </button>
  );
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.firstName || "Admin";

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(13,13,13,0.7) 0%, rgba(13,13,13,0.9) 50%, rgba(13,13,13,1) 100%), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="relative w-full h-52 rounded-3xl overflow-hidden mb-10">
            <img
              src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1800&q=80"
              alt="Super Admin"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-2">
                Super Admin
              </p>
              <h1
                className="text-5xl font-semibold text-white"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                Welcome, {firstName}
              </h1>
            </div>
          </div>

          {/* Two groups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Group 1 — User Management */}
            <div>
              <p className="text-xs tracking-[4px] uppercase text-[var(--gold)] mb-5 font-medium">
                User Management
              </p>
              <div className="flex flex-col gap-3">
                <HubCard
                  icon={Users}
                  title="Users"
                  description="View and manage all registered users"
                  onClick={() => navigate("/admin/users")}
                />
                <HubCard
                  icon={Shield}
                  title="Roles"
                  description="Create and manage user roles"
                  onClick={() => navigate("/admin/roles")}
                />
              </div>
            </div>

            {/* Group 2 — Platform */}
            <div>
              <p className="text-xs tracking-[4px] uppercase text-[var(--gold)] mb-5 font-medium">
                Platform
              </p>
              <div className="flex flex-col gap-3">
                <HubCard
                  icon={Wallet}
                  title="Payout Balance"
                  description="View platform payout balance"
                  onClick={() => navigate("/admin/payout-balance")}
                />
                <HubCard
                  icon={Settings}
                  title="Platform Settings"
                  description="Configure platform-wide settings"
                  onClick={() => navigate("/admin/settings")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
