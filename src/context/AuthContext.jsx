import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import axios from 'axios';
import Cookies from 'js-cookie'; // <-- Add this import

// Configurable timeouts (set to secure defaults: 20 min inactivity, 8 hours absolute)
const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes
const ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

const AuthContext = createContext({}); // Default to empty object
const salt = import.meta.env.VITE_COOKIE_SALT || 'default-salt-value';

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userTeam, setUserTeam] = useState(null); // Add team state
  const [accessToken, setAccessToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [apiUserRole, setApiUserRole] = useState(null);
  const [actualUserRole, setActualUserRole] = useState(null); // From token
  const [sessionStart, setSessionStart] = useState(Date.now());
  const inactivityTimerRef = useRef(null);
  const absoluteTimerRef = useRef(null);

  // Helper to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false; // If no exp, treat as not expired (legacy tokens)
      // exp is in seconds, Date.now() in ms
      return Date.now() >= payload.exp * 1000;
    } catch (e) {
      return true;
    }
  };

  // Helper to check absolute timeout
  const isAbsoluteTimeoutExceeded = () => {
    return Date.now() - sessionStart >= ABSOLUTE_TIMEOUT;
  };

  // Logout and show optional message
  const forceLogout = (msg) => {
    logout();
    if (msg && window && window.alert) {
      window.alert(msg);
    }
  };

  useEffect(() => {
    const userCookies = useStore.getState().getUserCookieData();
    
    // Only set states if values are non-null and non-empty
    if (userCookies.userRole && 
        userCookies.userName && 
        userCookies.userEmail && 
        userCookies.token) {
      
      setUserRole(userCookies.userRole);
      setUserName(userCookies.userName);
      setUserEmail(userCookies.userEmail);
      setUserId(userCookies.userId || null);
      setUserTeam(userCookies.userTeam || null); // Set team from cookies/store
      setAccessToken(userCookies.token);
      
      try {
        const decoded = JSON.parse(atob(userCookies.token.split('.')[1]));
        setDecodedToken(decoded);
        setActualUserRole(decoded.role); // Always set actualUserRole from token
      } catch (error) {
        console.error("Failed to decode token:", error);
        setDecodedToken(null);
        setActualUserRole(null);
      }
    }

    // Check token expiry on mount
    if (userCookies.token && isTokenExpired(userCookies.token)) {
      forceLogout("Session expired. Please log in again.");
      return;
    }

    // Fetch all users and set apiUserRole only if user is in the list and has TestEngineer role
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${apiUrl}/api/users/read_all_users`);
        setAllUsers(res.data);
        // Find the current user by email or id
        const currentUser = res.data.find(
          user => (user.email === userCookies.userEmail || user.id === userCookies.userId)
        );
        if (currentUser) {
          setUserTeam(currentUser.team || null); // Set team from API user
        }
        if (currentUser && currentUser.role === "TestEngineer") {
          setApiUserRole("TestEngineer");
        } else {
          setApiUserRole(null); // Not a TestEngineer in API
        }
      } catch (err) {
        setAllUsers([]);
        setApiUserRole(null);
      }
    };
    if (userCookies.userEmail || userCookies.userId) fetchUsers();
  }, []);

  // Listen for user activity to check token expiry and inactivity timeout
  useEffect(() => {
    // Clear any existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);

    const handleActivity = () => {
      // Inactivity timeout
      if (accessToken && isTokenExpired(accessToken)) {
        forceLogout("Session expired. Please log in again.");
        return;
      }
      if (isAbsoluteTimeoutExceeded()) {
        forceLogout("Session expired (maximum session length reached). Please log in again.");
        return;
      }
      // Reset inactivity timer
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        forceLogout("Session expired due to inactivity. Please log in again.");
      }, INACTIVITY_TIMEOUT);
    };

    // Absolute timeout
    absoluteTimerRef.current = setTimeout(() => {
      forceLogout("Session expired (maximum session length reached). Please log in again.");
    }, ABSOLUTE_TIMEOUT - (Date.now() - sessionStart));

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleActivity));
    handleActivity();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [accessToken, sessionStart]);

  const login = (role, name, email, employeeId, token, team) => {
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    setUserId(employeeId);
    setUserTeam(team || null);
    setAccessToken(token);
    setSessionStart(Date.now());
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setDecodedToken(decoded);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }

    // Update store with user cookie data
    useStore.getState().setUserCookieData({
      token,
      userRole: role,
      userName: name,
      LoggedIn: "true",
      userEmail: email,
      userId: employeeId,
      userTeam: team || "",
    });

    // Set browser cookies for persistence
    Cookies.set('token', token);
    Cookies.set('userRole', role);
    Cookies.set('userName', name);
    Cookies.set('LoggedIn', "true");
    Cookies.set('userEmail', email);
    Cookies.set('userId', employeeId);
    if (team) {
      Cookies.set('userTeam', team);
    }

    // Check token expiry at login
    if (isTokenExpired(token)) {
      forceLogout("Session expired. Please log in again.");
      return;
    }
  };

  const logout = () => {
    setUserRole(null);
    setUserName(null);
    setUserEmail(null);
    setUserId(null);
    setUserTeam(null);
    setAccessToken(null);
    setDecodedToken(null);
    setSessionStart(Date.now());

    // Clear stored user cookie data in the store
    useStore.getState().setUserCookieData({});

    // Remove browser cookies
    Cookies.remove('token');
    Cookies.remove('userRole');
    Cookies.remove('userName');
    Cookies.remove('LoggedIn');
    Cookies.remove('userEmail');
    Cookies.remove('userId');
    Cookies.remove('userTeam');
  };

  // Placeholder for reauthentication logic
  const reauthenticate = async () => {
    // Implement logic to prompt user for credentials and refresh session
    // For now, just force logout
    forceLogout("Session expired. Please log in again.");
  };

  return (
    <AuthContext.Provider value={{
      userRole,
      userName,
      userEmail,
      userId,
      userTeam,
      accessToken,
      decodedToken,
      login,
      logout,
      isAuthenticated: !!userRole,
      apiUserRole,
      actualUserRole,
      allUsers,
      inactivityTimeout: INACTIVITY_TIMEOUT,
      absoluteTimeout: ABSOLUTE_TIMEOUT,
      reauthenticate,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};