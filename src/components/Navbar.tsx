import React, { useState } from "react";
import { Film, Search, Star, Bookmark, User as UserIcon, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import SearchBar from "./SearchBar.tsx";
import LoginModal from "./LoginModal.tsx";
import SignupModal from "./SignupModal.tsx";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/", icon: Film },
    { label: "Movies", path: "/movies", icon: Star },
    { label: "Actors", path: "/actors", icon: UserIcon },
    { label: "Watchlist", path: "/watchlist", icon: Bookmark },
    { label: "Favorite Actors", path: "/favorite-actors", icon: UserIcon },
  ];

  return (
    <nav className="bg-gray-800/90 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group hover:scale-105 transition-transform">
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 50 50" 
                className="w-10 h-10 text-teal-400 group-hover:rotate-12 transition-transform"
              >
                <path 
                  fill="currentColor" 
                  d="M25 5C13.4 5 4 14.4 4 26s9.4 21 21 21 21-9.4 21-21S36.6 5 25 5zm-7 15c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H20c-1.1 0-2-.9-2-2V20zm2-7c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2v-1zm12 0c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2v-1z"
                />
                <circle 
                  cx="25" 
                  cy="26" 
                  r="3" 
                  fill="currentColor" 
                  className="group-hover:animate-pulse"
                />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-teal-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-2xl font-bold text-gray-200 group-hover:text-teal-300 transition-colors tracking-wider">
              MovieHub
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-200 hover:text-teal-300 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`
                  whitespace-nowrap text-gray-300 hover:text-white transition-colors flex items-center gap-2 
                  ${location.pathname === item.path ? 'text-teal-300 font-semibold' : ''}
                  group relative
                `}
              >
                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-teal-300 transition-colors" />
                {item.label}
                {location.pathname === item.path && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-teal-300 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xl px-8">
            <SearchBar />
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-full">
                  <UserIcon className="w-5 h-5 text-teal-300" />
                  <span className="text-gray-200 text-sm truncate max-w-[100px]">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button 
                  onClick={logout} 
                  className="bg-red-700/20 text-red-300 hover:bg-red-700/40 px-3 py-1.5 rounded-full transition-colors group"
                >
                  <span className="group-hover:text-gray-100">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowLogin(true)} 
                  className="bg-teal-600/20 text-teal-300 hover:bg-teal-600/40 px-4 py-2 rounded-full transition-colors group"
                >
                  <span className="group-hover:text-gray-100">Login</span>
                </button>
                <button 
                  onClick={() => setShowSignup(true)} 
                  className="bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 px-4 py-2 rounded-full transition-colors group"
                >
                  <span className="group-hover:text-gray-100">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 absolute left-0 right-0 top-16 py-4 border-b border-gray-700">
            <div className="flex flex-col space-y-4 px-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    whitespace-nowrap flex items-center gap-3 py-2 px-3 rounded-lg 
                    ${location.pathname === item.path 
                      ? 'bg-teal-300/20 text-teal-300' 
                      : 'text-gray-400 hover:bg-gray-700'}
                    transition-colors
                  `}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-700 pt-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-gray-700 px-3 py-2 rounded-lg">
                      <UserIcon className="w-6 h-6 text-teal-300" />
                      <span className="text-gray-200 truncate max-w-[200px]">
                        {user.displayName || user.email}
                      </span>
                    </div>
                    <button 
                      onClick={logout} 
                      className="w-full bg-red-700/20 text-red-300 hover:bg-red-700/40 px-3 py-2 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        setShowLogin(true);
                        setIsMobileMenuOpen(false);
                      }} 
                      className="w-full bg-teal-600/20 text-teal-300 hover:bg-teal-600/40 px-3 py-2 rounded-lg transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => {
                        setShowSignup(true);
                        setIsMobileMenuOpen(false);
                      }} 
                      className="w-full bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 px-3 py-2 rounded-lg transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Login & Signup Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </nav>
  );
};

export default Navbar;
