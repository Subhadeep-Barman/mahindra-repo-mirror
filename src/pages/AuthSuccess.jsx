import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/UI/spinner";
import showSnackbar from "../utils/showSnackbar";
import useStore from "../store/useStore";
import { jwtDecode } from "jwt-decode";
const apiURL = import.meta.env.VITE_BACKEND_URL;

// Validation functions for userloyee API fields
function isValidUserRole(role) {
  return typeof role === "string" && /^[A-Za-z0-9_-]{1,50}$/.test(role);
}

function isValidTeam(team) {
  return typeof team === "string" && /^[A-Za-z0-9_-]{1,50}$/.test(team);
}

function isValidlocation(location) {
  return typeof location === "string" &&
    /^[A-Za-z0-9_-]{1,50}$/.test(location);
}

// Validate that the userloyee data from the API conforms to expected types and values
const validateUserData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(user =>
    typeof user === "object" &&
    typeof user.id === "string" &&
    isValidUserRole(user.role) &&
    isValidTeam(user.team) && // <-- check for team
    isValidlocation(user.location) // <-- check for location
  );
};

export default function AuthSuccess() {
  const navigate = useNavigate();
  // You may need to import/use your AuthContext's login if available
  // const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      setLoading(true);
      try {
        const jwtToken = searchParams.get("jwt_token");
        const userDetails = jwtDecode(jwtToken);
        console.log("Decoded JWT Token:", userDetails);
        const response = await axios.get(`${apiURL}/api/users/read_all_users`);
        console.log("API response data:", response.data);

        // Debug: log each user object to see its structure
        if (Array.isArray(response.data)) {
          response.data.forEach((user, idx) => {
            console.log(`User[${idx}]:`, user);
          });
        }

        if (!validateUserData(response.data)) {
          throw new Error("Invalid userloyee data from API");
        }
        const users = response.data;
        const user = users.find((user) => user.id === userDetails.user);
        if (!user) {
          showSnackbar(
            "You are not registered, send mail to the Admin",
            "error"
          );
          navigate("/");
          return;
        }

        // Update the store with the user cookie data
        useStore.getState().setUserCookieData({
          token: jwtToken,
          userRole: user.role,
          LoggedIn: "true",
          userEmail: userDetails.emailaddress,
          userId: userDetails.user,
          userName: userDetails.displayname,
          teamType: user.team, // <-- use team
          location: user.location // <-- use location
        });

        // If you have a login function, call it here with the new parameters
        // login(
        //   user.role,
        //   userDetails.displayname,
        //   userDetails.emailaddress,
        //   userDetails.user,
        //   user.team_type,
        //   user.engine_type,
        //   jwtToken
        // );

        console.log("User authenticated successfully:", userDetails);
        showSnackbar("User authenticated successfully", "success");
        navigate("/home");
        console.log("User Cookie Data:", useStore.getState().userCookieData);

      } catch (error) {
        console.error("Authentication Error:", error);
        showSnackbar("Error processing JWT token", "warning");
        navigate("/");
        console.error("Error during authentication:", error);
      } finally {
        setLoading(false);
      }
    };
    authenticateUser();
  }, [navigate, searchParams]);

  return (
    <>
      <Spinner loading={loading} />
      <div className="full-container">hello world</div>
    </>
  );
}
