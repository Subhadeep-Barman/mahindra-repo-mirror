"use client"
import { Search, Fullscreen, Mail, Notifications, Menu, LightMode, DarkMode } from "@mui/icons-material"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import darkLogo from "../../assets/mai_dark.png"
import lightLogo from "../../assets/mai_light.png"

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <nav className="bg-white rounded-2xl dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center h-16">
        {/* Logo - Left Corner */}
        <div className="flex-shrink-0 pl-4">
          <img
            src={isDarkMode ? darkLogo : lightLogo}
            alt="MAI Logo"
            width={80}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Search Bar - Middle */}
        <div className="flex-1 px-4">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search for all the inspiration you need..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Right Side Icons - Hidden on Mobile */}
        <div className="hidden md:flex items-center space-x-16 pr-8">
          <button className="p-2 text-red-500 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <Mail className="h-5 w-5" />
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
            <button className="w-8 h-8 bg-red-500 dark:bg-red-500 text-white dark:text-white rounded-full flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-white focus:ring-offset-2">
              <span className="text-sm font-semibold text-white dark:text-white">A</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-red-500 dark:text-red-500 rounded-lg mr-4 hover:bg-red-50 dark:hover:bg-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t  dark:border-gray-800 py-2 transition-colors duration-200 rounded-xl">
          <div className="flex flex-col space-y-4 px-4">
            <button className="flex items-center space-x-2 text-red-500 dark:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Mail className="h-5 w-5" />
              <span>Messages</span>
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
              <div className="w-8 h-8 bg-red-500 dark:bg-red-500 rounded-full flex items-center justify-center transition-colors duration-200">
                <span className="text-white dark:text-white text-sm font-semibold">A</span>
              </div>
              <span>Profile</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
