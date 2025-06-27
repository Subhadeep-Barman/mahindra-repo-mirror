import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/UI/spinner";
// At the top of AuthSuccess.jsx
// import Spinner from "../components/UI/Spinner"; // adjust path as needed
import showSnackbar from "../utils/showSnackbar";
import useStore from "../store/useStore";
import { jwtDecode } from "jwt-decode";
const apiURL = import.meta.env.VITE_BACKEND_URL;

// Validation functions for employee API fields
function isValidUserRole(role) {
  return typeof role === "string" && /^[A-Za-z0-9_-]{1,50}$/.test(role);
}

function isValidTeamType(teamType) {
  return typeof teamType === "string" && /^[A-Za-z0-9_-]{1,50}$/.test(teamType);
}

function isValidEngineType(engineType) {
  return (
    typeof engineType === "string" && /^[A-Za-z0-9_-]{1,50}$/.test(engineType)
  );
}

// Validate that the employee data from the API conforms to expected types and values
const validateEmployeeData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(
    (emp) =>
      typeof emp === "object" &&
      typeof emp.id === "string" &&
      isValidUserRole(emp.role) &&
      isValidTeamType(emp.team_type) &&
      isValidEngineType(emp.engine_type)
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
        const response = await axios.get(`${apiURL}/employee/all`);

        if (!validateEmployeeData(response.data)) {
          throw new Error("Invalid employee data from API");
        }
        const employees = response.data;
        const user = employees.find((emp) => emp.id === userDetails.user);
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
          userEmployeeId: userDetails.user,
          userName: userDetails.displayname,
          teamType: user.team_type,
          engineType: user.engine_type,
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
  }, [navigate, searchParams]);

  return (
    <>
      <Spinner loading={loading} />
      <div className="full-container">hello world</div>
    </>
  );
}
