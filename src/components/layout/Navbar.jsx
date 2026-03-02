import { Link } from "react-router-dom";
import { Heart, User } from "lucide-react";
import logo from "../../assets/logo.png";

function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm px-6 h16 flex items-center justify-between">
      <Link to="/home" className="flex items-center gap-2">
        <img src={logo} alt="AquaKeys" className="w-12 h-12" />
        <span className="font-semibold text-lg">AquaKeys</span>
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium text-[#949494]">
        <Link to="/home" className="hover:text-[#c1aa77] transition-colors">
          Home
        </Link>
        <Link
          to="/properties"
          className="hover:text-[#c1aa77] transition-colors"
        >
          Properties
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/favorites"
          className="text-[#949494] hover:text-[#c1aa77] transition-colors"
        >
          <Heart size={22} />
        </Link>
        <Link
          to="/profile"
          className="text-[#949494] hover:text-[#c1aa77] transition-colors"
        >
          <User size={22} />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
