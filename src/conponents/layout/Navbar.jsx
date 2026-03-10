import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, User, Rocket, Loader2 } from "lucide-react";
import identityService from "../../services/identityService"; // تأكد إن المسار ده صح

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل للزرار
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // الفانكشن اللي بتبعت الريكوست وتفتح اللينك الخارجي
  const handleUpgradeClick = async () => {
    setIsLoading(true);
    try {
      const response = await identityService.upgradeToLandlord();
      
      // بنجيب اللينك من الرد (تأكد من الاسم في السواجر url أو redirectUrl)
      const externalUrl = response.data?.url || response.data?.redirectUrl;

      if (externalUrl) {
        // بيخرج من موقعك ويروح للينك اللي الباك بعته
        window.location.href = externalUrl;
      } else {
        alert("لم يتم العثور على رابط التحويل");
      }
    } catch (error) {
      console.error("Error fetching upgrade link:", error);
      alert("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-16 transition-all duration-400 font-jost ${
        scrolled
          ? "py-4 bg-[var(--dark)]/95 backdrop-blur-md border-b border-[#c1aa77]/10"
          : "py-6 bg-transparent"
      }`}
    >
      {/* Logo */}
      <Link
        to="/"
        className="font-cormorant text-2xl tracking-[4px] uppercase text-[var(--gold)]"
      >
        Aqua<span className="text-[var(--cream)]">Keys</span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-10">
        {[
          { to: "/", label: "Home" },
          { to: "/properties", label: "Properties" },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-[11px] tracking-[3px] uppercase transition-colors duration-300 relative group ${
              location.pathname === to
                ? "text-[var(--gold)]"
                : "text-[#f5f0e8]/60 hover:text-[var(--cream)]"
            }`}
          >
            {label}
            <span
              className={`absolute -bottom-1 left-0 h-px bg-[var(--gold)] transition-all duration-300 ${
                location.pathname === to ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        
        {/* زرار Upgrade الجديد */}
        <button
          onClick={handleUpgradeClick}
          disabled={isLoading}
          className="flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-[var(--gold)] border border-[var(--gold)]/30 px-4 py-2 hover:bg-[var(--gold)] hover:text-[var(--dark)] transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <span>Upgrade</span>
              <Rocket size={14} />
            </>
          )}
        </button>

        <Link
          to="/favorites"
          className="text-[#f5f0e8]/50 hover:text-[var(--gold)] transition-colors duration-300"
        >
          <Heart size={20} />
        </Link>
        
        <Link
          to="/profile"
          className="text-[#f5f0e8]/50 hover:text-[var(--gold)] transition-colors duration-300"
        >
          <User size={20} />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;