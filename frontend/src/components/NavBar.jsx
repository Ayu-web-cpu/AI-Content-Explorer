import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn =
    token && typeof token === "string" && token !== "null" && token.trim() !== "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navButton = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? "bg-white text-indigo-600 shadow"
        : "bg-blue-500 hover:bg-blue-600 text-white"
    }`;

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <NavLink
            to={isLoggedIn ? "/search" : "/"}
            className="text-lg font-bold tracking-wide hover:opacity-90 transition"
          >
            AI-Powered Content Explorer
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-white text-indigo-600 shadow hover:bg-slate-100 transition"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-1.5 rounded-full text-sm font-medium border border-white text-white hover:bg-indigo-500 transition"
                >
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/search" className={navButton}>
                  Search
                </NavLink>
                <NavLink to="/image" className={navButton}>
                  ImageGen
                </NavLink>
                <NavLink to="/dashboard" className={navButton}>
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-500 hover:bg-red-600 text-white shadow transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
            >
              {menuOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-indigo-700">
          {!isLoggedIn ? (
            <>
              <NavLink to="/login" className={navButton}>
                Login
              </NavLink>
              <NavLink to="/register" className={navButton}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/search" className={navButton}>
                Search
              </NavLink>
              <NavLink to="/image" className={navButton}>
                ImageGen
              </NavLink>
              <NavLink to="/dashboard" className={navButton}>
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 text-white shadow transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}





