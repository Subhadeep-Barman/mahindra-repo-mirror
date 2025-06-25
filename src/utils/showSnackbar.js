// frontend/src/utils/showSnackbar.js
import useStore from '../store/useStore';

const showSnackbar = (message, severity = 'info', duration = 2000) => {
  const {
    setSnackbarMessage,
    setSnackbarSeverity,
    setSnackbarDuration,
    setSnackbarOpen,
  } = useStore.getState();

  setSnackbarMessage(message);
  setSnackbarSeverity(severity);
  setSnackbarDuration(duration);
  setSnackbarOpen(true);
};

export default showSnackbar;