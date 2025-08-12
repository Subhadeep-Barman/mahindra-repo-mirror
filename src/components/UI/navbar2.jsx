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
import lightLogo from "../../assets/mai_light.png";

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
    <>
      <AppBar
        position='sticky'
        color="inherit"
        sx={{
          backgroundColor: 'rgba(255, 205, 210, 0.3)', // Light red/pink background
          backdropFilter: 'blur(10px)',
          borderRadius: '16px', 
          margin: '15px', 
          marginBottom: '0',
          padding: '0 20px', 
          width: `calc(100% - 30px)`,
          border: '1px solid rgba(244, 67, 54, 0.2)', // Light red border
          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: '48px !important' }}>
          {/* Logo */}
          <img 
            src={isDarkMode ? darkLogo : lightLogo} 
            height="85px" 
            width="40px" 
            alt="Logo" 
            style={{ marginRight: '12px' }}
          />
          
          {/* Title */}
          <div 
            style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#d32f2f',
              flexGrow: 1 
            }}
          >
            DBMRS
          </div>

          {/* Desktop Navigation - Hidden on Mobile */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Home Button */}
            <Tooltip title="Home" arrow>
              <IconButton 
                onClick={() => navigate("/home")}
                sx={{ 
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <Home />
              </IconButton>
            </Tooltip>

            {/* Notifications Button */}
            <Tooltip title="Notifications" arrow>
              <IconButton 
                sx={{ 
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <Notifications />
              </IconButton>
            </Tooltip>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2 px-2">
              <LightMode sx={{ color: '#ffc56dff', fontSize: '16px' }} />
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-red-500"
              />
              <DarkMode sx={{ color: '#d32f2f', fontSize: '16px' }} />
            </div>

            {/* Profile Button */}
            <div className="relative">
              <Tooltip title="Profile" arrow>
                <IconButton
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#b71c1c'
                    }
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>A</span>
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <IconButton
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            sx={{ 
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.1)'
              }
            }}
          >
            <Menu />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: '15px',
            right: '15px',
            backgroundColor: 'rgba(255, 205, 210, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            padding: '16px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)'
          }}
          className="md:hidden"
        >
          <div className="flex flex-col space-y-4">
            {/* Home Button Mobile */}
            <Tooltip title="Home" arrow>
              <IconButton 
                onClick={() => navigate("/home")}
                sx={{ 
                  color: '#d32f2f',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <Home sx={{ mr: 1 }} />
                Home
              </IconButton>
            </Tooltip>

            {/* Notifications Mobile */}
            <Tooltip title="Notifications" arrow>
              <IconButton 
                sx={{ 
                  color: '#d32f2f',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <Notifications sx={{ mr: 1 }} />
                Notifications
              </IconButton>
            </Tooltip>

            {/* Theme Toggle Mobile */}
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-2" style={{ color: '#d32f2f' }}>
                <LightMode sx={{ color: '#ffa726', fontSize: '16px' }} />
                <span>Dark Mode</span>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-red-500"
              />
            </div>

            {/* Profile Button Mobile */}
            <div className="flex items-center space-x-2 p-2" style={{ color: '#d32f2f' }}>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <span>Profile</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
