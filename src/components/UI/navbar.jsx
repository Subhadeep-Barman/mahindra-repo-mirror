import {
  Mail,
  Notifications,
  Menu,
  LightMode,
  DarkMode,
  Home,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AccountMenu from "@/components/UI/accountmenu";
import darkLogo from "../../assets/mai_dark.png";
import lightLogo from "../../assets/mai_dark.png";
import useStore from "@/store/useStore";

export default function Navbar() {
  const isDarkMode = useStore((s) => s.isDarkMode);
  const setIsDarkMode = useStore((s) => s.setIsDarkMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
    
    // Check system preference if no theme is set
    if (localStorage.getItem("theme-dark") === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (localStorage.getItem("theme-dark") === null) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setIsDarkMode]);

  const toggleDarkMode = (event) => {
    if (isAnimating) return; // Prevent rapid clicking
    
    
    setIsAnimating(true);
    setIsDarkMode(!isDarkMode);
    
    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 300);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
  <nav className="bg-black shadow-xl border border-black-200/60 dark:border-red-800/40 transition-all duration-300 rounded-2xl mt-5 mx-2 md:mx-4 hover:shadow-2xl hover:shadow-black-200/50 dark:hover:shadow-black-900/30 relative z-50">
      <div className="flex items-center justify-between h-14 px-4 md:px-8">
        {/* Logo - Left Corner */}
        <div className="flex-shrink-0">
          <img
            src={isDarkMode ? darkLogo : lightLogo}
            alt="MAI Logo"
            width={85}
            height={40}
            className="object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Right Side Icons - Hidden on Mobile */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            className="p-2.5 text-red-600 dark:text-red-400 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 hover:scale-105"
            onClick={() => navigate("/home")}
          >
            <Home className="h-5 w-5" />
          </button>
          
          {/* Enhanced Theme Toggle */}
          <div className={`relative transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={toggleDarkMode}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleDarkMode(e);
                }
              }}
              disabled={isAnimating}
              className={`
                theme-toggle relative flex items-center justify-between w-20 h-10 rounded-full p-1 transition-all duration-500 ease-in-out
                ${isDarkMode 
                  ? 'bg-gray-800 theme-toggle-dark' 
                  : 'bg-amber-400 theme-toggle-light'
                }
                hover:scale-105 active:scale-95
                ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none
              `}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              role="switch"
              aria-checked={isDarkMode}
              tabIndex={0}
            >
              {/* Toggle Handle */}
              <div
                className={`
                  absolute top-1 w-8 h-8 rounded-full transition-all duration-500 ease-in-out
                  ${isDarkMode 
                    ? 'translate-x-10 bg-gray-300' 
                    : 'translate-x-0 bg-white'
                  }
                `}
              />
              
              {/* Icons */}
              <div className="flex items-center justify-center w-8 h-8">
                <LightMode 
                  className={`h-4 w-4 transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-amber-400 opacity-60 scale-75' 
                      : 'text-amber-600 opacity-100 scale-100'
                  }`} 
                />
              </div>
              
              <div className="flex items-center justify-center w-8 h-8">
                <DarkMode 
                  className={`h-4 w-4 transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-gray-300 opacity-100 scale-100' 
                      : 'text-gray-600 opacity-60 scale-75'
                  }`} 
                />
              </div>
            </button>
            
            {/* Tooltip */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </div>
            </div>
          </div>

          <AccountMenu />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2.5 text-red-600 dark:text-red-400 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-900 dark:to-black border-t border-red-200/60 dark:border-red-800/40 py-3 transition-all duration-300 rounded-xl mt-2">
          <div className="flex flex-col space-y-4 px-4">
            {/* Enhanced Mobile Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 border border-red-200/60 dark:border-red-700/40">
              <div className="flex items-center space-x-3 text-red-700 dark:text-red-300">
                <LightMode className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Theme</span>
              </div>
              
              {/* Mobile Toggle Button */}
              <button
                onClick={toggleDarkMode}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDarkMode(e);
                  }
                }}
                disabled={isAnimating}
                className={`
                  theme-toggle relative flex items-center justify-between w-16 h-8 rounded-full p-1 transition-all duration-500 ease-in-out
                  ${isDarkMode 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 theme-toggle-dark' 
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 theme-toggle-light'
                  }
                  hover:scale-105 active:scale-95
                  ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                role="switch"
                aria-checked={isDarkMode}
                tabIndex={0}
              >
                <div
                  className={`
                    absolute top-1 w-6 h-6 rounded-full transition-all duration-500 ease-in-out
                    ${isDarkMode 
                      ? 'translate-x-7 bg-gray-300' 
                      : 'translate-x-0 bg-white'
                    }
                    ${isAnimating ? 'animate-pulse' : ''}
                  `}
                />
                
                <div className="flex items-center justify-center w-6 h-6">
                  <LightMode 
                    className={`h-3 w-3 transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-amber-400 opacity-60' 
                        : 'text-amber-600 opacity-100'
                    }`} 
                  />
                </div>
                
                <div className="flex items-center justify-center w-6 h-6">
                  <DarkMode 
                    className={`h-3 w-3 transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-gray-300 opacity-100' 
                        : 'text-gray-600 opacity-60'
                    }`} 
                  />
                </div>
              </button>
            </div>

            <div className="px-2">
              <AccountMenu />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
