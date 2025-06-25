import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import Spinner from "../components/ui/spinner";
import showSnackbar from "../utils/showSnackbar";
import useStore from "../store/useStore";
import { jwtDecode } from "jwt-decode";
//import { useAuth } from "../context/AuthContext";

const apiURL = import.meta.env.VITE_BACKEND_URL;

// Validation for your user object
const validateEmployeeData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(emp =>
    typeof emp === "object" &&
    typeof emp.user_id === "string" &&
    typeof emp.password === "string" &&
    typeof emp.team_type === "string" &&
    typeof emp.team_location === "string"
  );
};

export default function AuthSuccess() {
  const navigate = useNavigate();
  //const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      setLoading(true);
      try {
        const jwtToken = searchParams.get("jwt_token");
        const userDetails = jwtDecode(jwtToken);
        console.log("Decoded JWT Token:", userDetails);
        const response = await axios.get(`${apiURL}/employee/all`);
        console.log("API response data:", response.data);

        if (!validateEmployeeData(response.data)) {
          throw new Error("Invalid employee data from API");
        }
        const employees = response.data;
        // Find user by user_id
        const user = employees.find(emp => emp.user_id === userDetails.user_id);
        if (!user) {
          showSnackbar("You are not registered, send mail to the Admin", "error");
          navigate("/");
          return;
        }

        // Optionally set cookies if needed
        // Cookies.set('token', jwtToken, { expires: 7 });

        // Update the store with the user cookie data
        useStore.getState().setUserCookieData({
          token: jwtToken,
          userId: user.user_id,
          teamType: user.team_type,
          teamLocation: user.team_location,
        });

        // Call login with your new parameters
        login(
          user.user_id,
          user.password,
          user.team_type,
          user.team_location,
          jwtToken
        );
        navigate("/home?tab=viewjoborders");
      } catch (error) {
        console.error("Authentication Error:", error);
        showSnackbar("Error processing JWT token", "warning");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    authenticateUser();
  }, [ navigate, searchParams]);

  return (
    <>
      <Spinner loading={loading} />
      <div className="full-container">hello world</div>
    </>
  );
}