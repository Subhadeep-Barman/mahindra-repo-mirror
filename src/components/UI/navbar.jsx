"use client"
import { Mail, Notifications, Menu, LightMode, DarkMode } from "@mui/icons-material"
import { useState, useEffect } from "react"
import { Switch } from "@/components/UI/switch"
import AccountMenu from "@/components/UI/accountmenu"
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
    <nav className="bg-black dark:bg-zinc-900/80 shadow-sm border-b border-gray-900 dark:border-zinc-800 transition-colors duration-200 rounded-2xl mt-2 mx-2 md:mx-4">
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

          <div className="flex items-center gap-2">
            <LightMode className="h-4 w-4 text-yellow-500" />
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
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-800 py-2 transition-colors duration-200 rounded-xl">
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
  )
}
