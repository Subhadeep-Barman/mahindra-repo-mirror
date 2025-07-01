"use client";
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
import { Switch } from "@/components/UI/switch";
import darkLogo from "../../assets/mai_dark.png";
import lightLogo from "../../assets/mai_dark.png";

export default function Navbar2() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <nav className="bg-white rounded-2xl dark:bg-zinc-900/80 shadow-sm border-b border-gray-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Logo - Left Corner */}
        <div className="flex-shrink-0">
          <img
            src={isDarkMode ? darkLogo : lightLogo}
            alt="MAI Logo"
            width={80}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Right Side Icons - Hidden on Mobile */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            className="p-2 text-red-500 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => navigate("/home")}
          >
            <Home className="h-5 w-5" />
          </button>

          <button className="p-2 text-red-500 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <Notifications className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <LightMode className="h-4 w-4 text-yellow-500" />
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-red-500"
            />
            <DarkMode className="h-4 w-4 text-red-500 dark:text-red-500" />
          </div>

          <div className="relative">
            <button className="w-8 h-8 bg-red-500 dark:bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              <span className="text-sm font-semibold">A</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-red-500 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-800 py-2 transition-colors duration-200 rounded-xl">
          <div className="flex flex-col space-y-4 px-4">
            <button
              className="flex items-center space-x-2 text-red-500 dark:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => navigate("/home")}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>

            <button className="flex items-center space-x-2 text-red-500 dark:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Notifications className="h-5 w-5" />
              <span>Notifications</span>
            </button>

            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-2 text-red-500 dark:text-red-500">
                <LightMode className="h-4 w-4 text-yellow-500" />
                <span>Dark Mode</span>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-red-500"
              />
            </div>

            <button className="flex items-center space-x-2 p-2 text-red-500 dark:text-red-500">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center transition-colors duration-200">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <span>Profile</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
