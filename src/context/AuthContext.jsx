import React, { createContext, useContext, useState, useEffect } from 'react';
import useStore from '../store/useStore';

const AuthContext = createContext({}); // Default to empty object
const salt = import.meta.env.VITE_COOKIE_SALT || 'default-salt-value';

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [teamType, setTeamType] = useState(null);
  const [location, setLocation] = useState(null);

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
      setTeamType(userCookies.teamType || null);
      setLocation(userCookies.location || null);
      
      try {
        const decoded = JSON.parse(atob(userCookies.token.split('.')[1]));
        setDecodedToken(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
        setDecodedToken(null);
      }
    }
  }, []);

  const login = (role, name, email, employeeId, teamTy, locationVal, token) => {
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    setUserId(employeeId);
    setAccessToken(token);
    setTeamType(teamTy);
    setLocation(locationVal);
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
      teamType: teamTy,
      location: locationVal,
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
    setTeamType(null);
    setLocation(null);

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
      teamType,
      location,
      login,
      logout,
      isAuthenticated: !!userRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};