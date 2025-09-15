import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import useStore from '../store/useStore';
import showSnackbar from '../utils/showSnackbar';

const INACTIVITY_TIMEOUT = 40 * 60 * 1000; // 40 minutes in milliseconds

export const useInactivityHandler = () => {
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);

  // Clear user session and logout
  const logoutUser = useCallback(() => {
    // Clear all cookies
    Cookies.remove('token');
    Cookies.remove('userRole');
    Cookies.remove('userId');
    Cookies.remove('userName');
    Cookies.remove('userEmail');
    Cookies.remove('LoggedIn');
    Cookies.remove('userTeam');

    // Clear store
    useStore.getState().setUserCookieData({});

    showSnackbar('Session expired due to inactivity. Please login again.', 'warning');
    navigate('/login');
  }, [navigate]);

  // Reset timer on user activity
  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Set new timer
    inactivityTimer.current = setTimeout(logoutUser, INACTIVITY_TIMEOUT);
  }, [logoutUser]);

  // Check if user is logged in
  const isUserLoggedIn = useCallback(() => {
    const loggedIn = Cookies.get('LoggedIn');
    const token = Cookies.get('token');
    return loggedIn === 'true' && token;
  }, []);

  useEffect(() => {
    // Only start inactivity tracking if user is logged in
    if (!isUserLoggedIn()) {
      return;
    }

    // Events to track for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });

      // Clear timer
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [resetTimer, isUserLoggedIn]);
};
