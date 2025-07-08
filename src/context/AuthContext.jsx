import React, { createContext, useContext, useState, useEffect } from 'react';
import useStore from '../store/useStore';
import axios from 'axios';
import Cookies from 'js-cookie'; // <-- Add this import

const AuthContext = createContext({}); // Default to empty object
const salt = import.meta.env.VITE_COOKIE_SALT || 'default-salt-value';

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [apiUserRole, setApiUserRole] = useState(null);
  const [actualUserRole, setActualUserRole] = useState(null); // From token

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
    // Fetch all users and set apiUserRole only if user is in the list and has TestEngineer role
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${apiUrl}/api/users/read_all_users`);
        setAllUsers(res.data);
        // Find the current user by email or id
        const currentUser = res.data.find(
          user => user.email === userCookies.userEmail || user.id === userCookies.userId
        );
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

  const login = (role, name, email, employeeId, token) => {
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    setUserId(employeeId);
    setAccessToken(token);
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
    });

    // Set browser cookies for persistence
    Cookies.set('token', token);
    Cookies.set('userRole', role);
    Cookies.set('userName', name);
    Cookies.set('LoggedIn', "true");
    Cookies.set('userEmail', email);
    Cookies.set('userId', employeeId);
  };

  const logout = () => {
    setUserRole(null);
    setUserName(null);
    setUserEmail(null);
    setUserId(null);
    setAccessToken(null);
    setDecodedToken(null);

    // Clear stored user cookie data in the store
    useStore.getState().setUserCookieData({});

    // Remove browser cookies
    Cookies.remove('token');
    Cookies.remove('userRole');
    Cookies.remove('userName');
    Cookies.remove('LoggedIn');
    Cookies.remove('userEmail');
    Cookies.remove('userId');
  };

  return (
    <AuthContext.Provider value={{
      userRole,
      userName,
      userEmail,
      userId,
      accessToken,
      decodedToken,
      login,
      logout,
      isAuthenticated: !!userRole,
      apiUserRole, // Only TestEngineer if found in API
      actualUserRole, // Always from token
      allUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};