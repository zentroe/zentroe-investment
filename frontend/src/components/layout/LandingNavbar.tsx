// src/components/LandingNavbar.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import logo from "@/assets/zenLogo.png";

const navLinks = [
  { name: "Real Estate", path: "/real-estate" },
  { name: "Agriculture", path: "/agriculture" },
  { name: "Private Credit", path: "/private-credit" },
  { name: "Venture", path: "/venture" },
  // { name: "Resources", path: "/resources" },
];

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="py-4 w-full border-b bg-[#FAF9F6] sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex justify-between items-center md:px-4 px-6">

        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Zentroe Logo" className="h-7" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-md font-medium py-1  transition ${isActive ? " border-b border-gray-700  " : "text-gray-700 hover:border-gray-700 hover:border-b"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="flex items-center gap-4 ml-8">
            <Link
              to="/auth/login"
              className="text-sm text-gray-700 hover:text-primary"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 bg-primary text-white rounded-md hover:bg-[#8c391e] text-sm transition"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Slide Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
              className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 p-6 flex flex-col gap-8"
            >
              <div className="flex justify-between items-center">
                <img src={logo} alt="Zentroe Logo" className="h-5" />
                <button onClick={() => setMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-base transition ${isActive ? "text-primary font-semibold" : "text-gray-700 hover:text-primary"
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-4">
                <Link
                  to="/auth/login"
                  className="text-gray-700 hover:text-primary text-center"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 bg-primary text-white rounded-md text-center hover:bg-[#8c391e]"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
