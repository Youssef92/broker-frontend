import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, User } from "lucide-react";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
