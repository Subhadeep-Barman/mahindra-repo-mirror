import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import useUserInteractionLogger from "../../hooks/useUserInteractionLogger"; 
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
// Keep Box at the end to avoid vite error
import Box from "@mui/material/Box";
import useStore from "../../store/useStore";
import { useAuth } from "../../context/AuthContext"; 

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const {logout} = useAuth(); 
  // const { userName, userEmail, userEmployeeId } = useAuth();
  // Fetch user data directly from cookies
  const userCookies = useStore.getState().getUserCookieData();
	const userRole = userCookies.userRole;
  const userName = userCookies.userName;
  const userEmail = userCookies.userEmail;
  const userEmployeeId = userCookies.userEmployeeId;
  const teamType = userCookies.teamType; 
  const { logInteraction } = useUserInteractionLogger(userEmployeeId);
  const navigate = useNavigate();

  function handleLogout() {
    console.log("Logging out...");
    logout();
    logInteraction("User logged out");
    navigate("/");
    logger.info("User logged out");
  }

  const handleNavigation = (path, interaction) => {
    logInteraction(interaction);
    navigate(path);
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          // color: 'primary.main',
        }}
      >
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            {/* Background color converted to secondary.main */}
            <Avatar
              sx={{
                width: 31,
                height: 31,
                color: "#e5e7eb",
                backgroundColor: "#f44336",
              }}
            ></Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => logInteraction("Employee ID clicked")}>
          {userEmployeeId}
        </MenuItem>
        <MenuItem onClick={() => logInteraction("Email clicked")}>
          {userEmail}
        </MenuItem>
        <MenuItem onClick={() => logInteraction("User name clicked")}>
          {userRole}
        </MenuItem>
        <MenuItem onClick={() => logInteraction("User name clicked")}>
          <Avatar /> {userName}
        </MenuItem>
        <MenuItem onClick={() => logInteraction("User teamtype clicked")}>
          <Avatar /> {teamType}
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigation("/home", "Navigated to Dashboard")}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
