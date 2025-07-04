import React, { createContext, useContext, useState, useEffect } from 'react';
import useStore from '../store/useStore';
import axios from 'axios';

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
      } catch (error) {
        console.error("Failed to decode token:", error);
        setDecodedToken(null);
      }
    }
    // Fetch all users and set apiUserRole
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${apiUrl}/read_all_users`);
        setAllUsers(res.data);
        // Find the current user by email or id
        const currentUser = res.data.find(
          user => user.email === userCookies.userEmail || user.id === userCookies.userId
        );
        if (currentUser) setApiUserRole(currentUser.role);
        else setApiUserRole(null);
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

    // Update store with user cookie data instead of setting cookies.
    useStore.getState().setUserCookieData({
      token,
      userRole: role,
      userName: name,
      LoggedIn: "true",
      userEmail: email,
      userId: employeeId,
    });
  };

  const logout = () => {
    // Clear state values
    setUserRole(null);
    setUserName(null);
    setUserEmail(null);
    setUserId(null);
    setAccessToken(null);
    setDecodedToken(null);

    // Clear stored user cookie data in the store
    console.log("Clearing user cookie data...");
    useStore.getState().setUserCookieData({});
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
      apiUserRole,
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