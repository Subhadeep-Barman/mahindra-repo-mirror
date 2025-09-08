import {
  Mail,
  Notifications,
  Menu,
  LightMode,
  DarkMode,
  Home,
  Settings,
  AddCircleOutline, // <-- Add this import
} from "@mui/icons-material";
import { HiUserAdd } from "react-icons/hi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/UI/button";
import { Select, MenuItem, Chip, InputLabel, FormControl, OutlinedInput, Box } from "@mui/material";
import axios from "axios";

import AccountMenu from "@/components/UI/accountmenu";
import darkLogo from "../../assets/mai_dark.png";
import lightLogo from "../../assets/mai_dark.png";
import useStore from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import showSnackbar from "@/utils/showSnackbar";

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function Navbar({ onHomeClick }) {
  const isDarkMode = useStore((s) => s.isDarkMode);
  const setIsDarkMode = useStore((s) => s.setIsDarkMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();
  const { userRole } = useAuth();
  // Notification popup state
  const [showBellPopup, setShowBellPopup] = useState(false);
  const [dropdownValue, setDropdownValue] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [newFields, setNewFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User info for mail
  const userCookies = useStore.getState().getUserCookieData();
  const userName = userCookies.userName;
  const userEmployeeId = userCookies.userId;

  // Field options
  const fieldOptions = [
    { value: "projectcode", label: "Project Code" },
    { value: "domain", label: "Domain" },
    { value: "mode", label: "Mode" },
    { value: "vehicle_models", label: "Vehicle Models" },
    { value: "test_type", label: "Test Type" },
    { value: "fuel_type", label: "Fuel Type" },
  ];

  // Multi-select handler
  const handleFieldSelect = (e) => {
    const value = e.target.value;
    setSelectedFields(value);
    setNewFields(prev => {
      const updated = { ...prev };
      value.forEach(f => {
        if (!updated[f]) updated[f] = [""];
      });
      Object.keys(updated).forEach(f => {
        if (!value.includes(f)) delete updated[f];
      });
      return updated;
    });
  };

  // Add/Remove/Change field value handlers
  const handleAddFieldInput = (field) => {
    setNewFields(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };
  const handleFieldInputChange = (field, idx, value) => {
    setNewFields(prev => ({
      ...prev,
      [field]: prev[field].map((v, i) => i === idx ? value : v),
    }));
  };
  const handleRemoveFieldInput = (field, idx) => {
    setNewFields(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx),
    }));
  };

  // Mail API handler
  const handleSendMail = async (caseId, directJobOrderId = null, testOrderId = null) => {
    try {
      const payload = {
        user_name: userName,
        token_id: userEmployeeId,
        role: userRole,
        job_order_id: directJobOrderId || "",
        test_order_id: testOrderId || null,
        caseid: String(caseId),
        cft_members: "",
        notify_fields: selectedFields,
        notify_values: Object.fromEntries(
          selectedFields.map(f => [f, (newFields[f] || []).filter(v => v.trim() !== "")])
        ),
      };
      await axios.post(`${apiURL}/send`, payload);
      showSnackbar("Request sent to admin!", "success");
      setShowBellPopup(false);
      setDropdownValue("");
      setSelectedFields([]);
      setNewFields({});
    } catch (err) {
      showSnackbar("Failed to send request.", "error");
    }
    setIsSubmitting(false);
  };

  const handleSubmitNewFields = async () => {
    setIsSubmitting(true);
    await handleSendMail(7, "", null);
    setIsSubmitting(false);
  };

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
          {userRole === "Admin" && (
            <>
              <button
                className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 transition-all duration-200 h-8 transform hover:scale-105 hover:shadow-lg"
                onClick={() => navigate("/admin-portal")}
                title="Admin Portal"
                style={{ minWidth: 0 }}
              >
                <HiUserAdd className="h-6 w-6 text-white" />
                <span className="font-semibold text-sm text-white">Admin Portal</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 transition-all duration-200 h-8 transform hover:scale-105 hover:shadow-lg"
                onClick={() => navigate("/admin/dropdown-options")}
                title="Manage Dropdowns"
                style={{ minWidth: 0 }}
              >
                <Settings className="h-6 w-6 text-white" />
                <span className="font-semibold text-sm text-white">Manage Dropdowns</span>
              </button>
            </>
          )}

          {/* Bell Icon for ProjectTeam and Admin */}
          {(userRole === "ProjectTeam") && (
            <button
              className="p-2.5 text-yellow-400 dark:text-yellow-300 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 dark:hover:from-yellow-900/20 dark:hover:to-yellow-800/20 hover:text-yellow-300 dark:hover:text-yellow-200 transition-all duration-300 hover:scale-105"
              onClick={() => setShowBellPopup(true)}
              title="Notifications"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Notifications className="h-6 w-6 text-yellow-400" />
            </button>
          )}

          <button
            className="p-2.5 text-red-600 dark:text-red-400 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 hover:scale-105"
             onClick={() => onHomeClick ? onHomeClick("/home") : navigate("/home")}
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
            {/* Admin Portal Buttons for Mobile */}
            {userRole === "Admin" && (
              <div className="flex flex-col space-y-2">
                <button
                  className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 transition-all duration-200 h-8 transform hover:scale-105 hover:shadow-lg"
                  onClick={() => {
                    navigate("/admin-portal");
                    setIsMenuOpen(false);
                  }}
                  style={{ minWidth: 0 }}
                >
                  <HiUserAdd className="h-6 w-6 text-white" />
                  <span className="font-semibold text-sm text-white">Admin Portal</span>
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 transition-all duration-200 h-8 transform hover:scale-105 hover:shadow-lg"
                  onClick={() => {
                    navigate("/admin/dropdown-options");
                    setIsMenuOpen(false);
                  }}
                  style={{ minWidth: 0 }}
                >
                  <Settings className="h-6 w-6 text-white" />
                  <span className="font-semibold text-sm text-white">Manage Dropdowns</span>
                </button>
              </div>
            )}
            
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

      {/* Bell Popup Modal */}
      {showBellPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Request Admin Action</h2>
              <Button variant="ghost" onClick={() => setShowBellPopup(false)}>
                Close
              </Button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Select Action</label>
              <select
                className="border px-2 py-1 rounded w-full"
                value={dropdownValue}
                onChange={e => {
                  setDropdownValue(e.target.value);
                  setSelectedFields([]);
                  setNewFields({});
                }}
              >
                <option value="">-- Select --</option>
                <option value="add_new_field">Add New Field</option>
                {/* Add more options if needed */}
              </select>
            </div>
            {dropdownValue === "add_new_field" && (
              <div>
                <div className="mb-4">
                  <FormControl fullWidth>
                    <InputLabel id="field-multiselect-label">
                      Which fields do you want to add new values for?
                    </InputLabel>
                    <Select
                      labelId="field-multiselect-label"
                      multiple
                      value={selectedFields}
                      onChange={handleFieldSelect}
                      input={<OutlinedInput label="Which fields do you want to add new values for?" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={fieldOptions.find(f => f.value === value)?.label || value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 4.5 + 8,
                            width: 250,
                          },
                        },
                      }}
                    >
                      {fieldOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                {selectedFields.map(field => (
                  <div key={field} className="mb-4 border rounded p-3 bg-gray-50">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-sm mr-2">{fieldOptions.find(f => f.value === field)?.label}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-green-600"
                        onClick={() => handleAddFieldInput(field)}
                      >
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <span className="material-icons"><AddCircleOutline /></span> Add More
                        </span>
                      </Button>
                    </div>
                    {newFields[field]?.map((val, idx) => (
                      <div key={idx} className="flex items-center mb-2">
                        <input
                          className="border px-2 py-1 rounded text-sm flex-1"
                          value={val}
                          onChange={e => handleFieldInputChange(field, idx, e.target.value)}
                          placeholder={`New value #${idx + 1}`}
                        />
                        {newFields[field].length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="ml-1 text-red-500"
                            onClick={() => handleRemoveFieldInput(field, idx)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBellPopup(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-yellow-600 text-white"
                disabled={
                  isSubmitting ||
                  !dropdownValue ||
                  (dropdownValue === "add_new_field" &&
                    (selectedFields.length === 0 ||
                      selectedFields.every(f => (newFields[f] || []).filter(v => v.trim() !== "").length === 0)
                    )
                  )
                }
                onClick={handleSubmitNewFields}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
