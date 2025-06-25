import React, { createContext, useContext, useState, useEffect } from 'react';
import useStore from '../store/useStore';

const AuthContext = createContext();
const salt = import.meta.env.VITE_COOKIE_SALT || 'default-salt-value';

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userEmployeeId, setUserEmployeeId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [teamType, setTeamType] = useState(null);
  const [engineType, setEngineType] = useState(null);

  useEffect(() => {
    const userCookies = useStore.getState().getUserCookieData();
    
    // Only set states if values are non-null and non-empty
    if (userCookies.userRole && 
        userCookies.userName && 
        userCookies.userEmail && 
        userCookies.userEmployeeId && 
        userCookies.token) {
      
      setUserRole(userCookies.userRole);
      setUserName(userCookies.userName);
      setUserEmail(userCookies.userEmail);
      setUserEmployeeId(userCookies.userEmployeeId);
      setAccessToken(userCookies.token);
      setTeamType(userCookies.teamType || null);
      setEngineType(userCookies.engineType || null);
      
      try {
        const decoded = JSON.parse(atob(userCookies.token.split('.')[1]));
        setDecodedToken(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
        setDecodedToken(null);
      }
    }
  }, []);

  const login = (role, name, email, employeeId, teamTy, engineTy, token) => {
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    setUserEmployeeId(employeeId);
    setAccessToken(token);
    setTeamType(teamTy);
    setEngineType(engineTy);
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
      userEmployeeId: employeeId,
      teamType: teamTy,
      engineType: engineTy,
    });
  };

  const logout = () => {
    // Clear state values
    setUserRole(null);
    setUserName(null);
    setUserEmail(null);
    setUserEmployeeId(null);
    setAccessToken(null);
    setDecodedToken(null);
    setTeamType(null);
    setEngineType(null);

    // Clear stored user cookie data in the store
    console.log("Clearing user cookie data...");
    useStore.getState().setUserCookieData({});
  };

  return (
    <AuthContext.Provider value={{
      userRole,
      userName,
      userEmail,
      userEmployeeId,
      accessToken,
      decodedToken,
      teamType,
      login,
      logout,
      isAuthenticated: !!userRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);