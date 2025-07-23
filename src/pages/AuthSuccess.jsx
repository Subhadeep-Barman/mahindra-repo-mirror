import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/UI/spinner";
import showSnackbar from "../utils/showSnackbar";
import useStore from "../store/useStore";
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
const apiURL = import.meta.env.VITE_BACKEND_URL;

function isValidUserRole(role) {
  return typeof role === "string" && /^[A-Za-z0-9 _-]{1,50}$/.test(role);
}

// Validate that the userloyee data from the API conforms to expected types and values
const validateUserData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(user =>
    typeof user === "object" &&
    typeof user.id === "string" &&
    isValidUserRole(user.role)
  );
};

export default function AuthSuccess() {
  const navigate = useNavigate();
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
          navigate("/login");
          return;
        }

        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 24 * 60 * 60 * 1000); // 1 hour from now

        Cookies.set("token", jwtToken, {
          expires: expirationDate,
          secure: true,
        });

        Cookies.set("userRole", user.role, {
          expires: expirationDate,
          secure: true,
        });
        Cookies.set("userId", userDetails.user, {
          expires: expirationDate,
          secure: true,
        });
        Cookies.set("userName", userDetails.displayname, {
          expires: expirationDate,
          secure: true,
        });
        Cookies.set("userEmail", userDetails.emailaddress, {
          expires: expirationDate,
          secure: true,
        });
        Cookies.set("LoggedIn", "true", {
          expires: expirationDate,
          secure: true,
        });

        useStore.getState().setUserCookieData({
          token: jwtToken,
          userRole: user.role,
          LoggedIn: "true",
          userEmail: userDetails.emailaddress,
          userId: userDetails.user,
          userName: userDetails.displayname
        });

        console.log("User authenticated successfully:", userDetails);
        showSnackbar("User authenticated successfully", "success");
        navigate("/home");

      } catch (error) {
        console.error("Authentication Error:", error);
        showSnackbar("Error processing JWT token", "warning");
        navigate("/login");
        console.error("Error during authentication:", error);
      } finally {
        setLoading(false);
      }
    };
    authenticateUser();
  }, [navigate, searchParams]);

  return (
    <>
      <Spinner loadings={loading} />
      <div className="full-container">loading....</div>
    </>
  );
}