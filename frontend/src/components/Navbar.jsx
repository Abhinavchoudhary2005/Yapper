import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Menu, X, LogOut, User } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { logout, authUser } = useAuthStore();

  return (
    <nav className="navbar bg-base-200 shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center px-4 lg:px-8">
        {/* Left Section */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <a className="text-xl font-bold -mt-1 ml-2">Yapper</a>
        </div>

        {/* Right Section */}
        <div className="flex-none">
          {/* Menu Toggle for Small Screens */}
          <button
            className="btn btn-ghost lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Menu */}
          <ul
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } absolute top-full right-0 w-56 bg-base-100 shadow-lg rounded-lg p-4 flex-col items-center space-y-2 font-bold z-50 lg:static lg:flex lg:flex-row lg:w-auto lg:space-x-4 lg:bg-transparent lg:shadow-none lg:p-0 lg:space-y-0 lg:items-center`}
          >
            <li>
              <label className="flex items-center cursor-pointer gap-2">
                {/* Light Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
                {/* Theme Toggle */}
                <input
                  type="checkbox"
                  className="toggle theme-controller"
                  aria-label="Toggle Theme"
                  checked={theme === "business"}
                  onChange={() => {
                    setTheme(theme === "wireframe" ? "business" : "wireframe");
                    document.documentElement.classList.add(theme);
                  }}
                />
                {/* Dark Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </label>
            </li>
            {authUser ? (
              <li>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="lg:inline">Profile</span>
                </Link>
              </li>
            ) : (
              ""
            )}
            {authUser ? (
              <li>
                <button
                  onClick={async () => {
                    await logout();
                    await navigate("/login");
                    setIsMenuOpen(false);
                  }}
                  className="flex"
                >
                  <LogOut className="mr-2" />
                  Logout
                </button>
              </li>
            ) : (
              ""
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
