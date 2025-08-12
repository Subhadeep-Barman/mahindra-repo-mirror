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
import AccountMenu from "@/components/UI/accountmenu";
import darkLogo from "../../assets/mai_dark.png";
import lightLogo from "../../assets/mai_light.png";
import useStore from "@/store/useStore";

export default function Navbar() {
  const isDarkMode = useStore((s) => s.isDarkMode);
  const setIsDarkMode = useStore((s) => s.setIsDarkMode);
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
    <nav className="bg-red-50 dark:bg-red-900/20 shadow-sm border border-red-200 dark:border-red-800 transition-colors duration-200 rounded-2xl mt-5 mx-2 md:mx-4">
      <div className="flex items-center justify-between h-12 px-4 md:px-8">
        {/* Logo - Left Corner */}
        <div className="flex-shrink-0">
          <img
            src={isDarkMode ? darkLogo : lightLogo}
            alt="MAI Logo"
            width={85}
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
          <div className="flex items-center gap-2">
            <LightMode className="h-4 w-4 text-yellow-400" />
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-red-500"
            />
            <DarkMode className="h-4 w-4 text-red-500 dark:text-red-500" />
          </div>

          <AccountMenu />
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
        <div className="md:hidden bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 py-2 transition-colors duration-200 rounded-xl">
          <div className="flex flex-col space-y-4 px-4">
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

            <div className="px-2">
              <AccountMenu />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
