import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/UI/spinner";
import showSnackbar from "../utils/showSnackbar";
import useStore from "../store/useStore";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
// import base64url from "base64url";
// import { decode as base64urlDecode } from "base64url";

const apiURL = import.meta.env.VITE_BACKEND_URL;

// Secret key for decryption
const SECRET_KEY = "MySecretKey12345";

// Decrypt function
function decrypt(encryptedText, secretKey) {
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
function base64UrlToBase64(base64UrlString) {
  return base64UrlString
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(base64UrlString.length / 4) * 4, "=");
}

function isValidUserRole(role) {
  return typeof role === "string" && /^[A-Za-z0-9 _-]{1,50}$/.test(role);
}

// Add team validation
function isValidUserTeam(team) {
  return typeof team === "string" && /^[A-Za-z0-9 _-]{0,50}$/.test(team);
}

// Validate that the userloyee data from the API conforms to expected types and values
const validateUserData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(
    (user) =>
      typeof user === "object" &&
      typeof user.id === "string" &&
      isValidUserRole(user.role) &&
      (user.team === undefined || isValidUserTeam(user.team))
  );
};

// Helper to check if JWT token is expired
function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false; // If no exp, treat as not expired (legacy tokens)
    return Date.now() >= decoded.exp * 1000;
  } catch (e) {
    return true;
  }
}

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      setLoading(true);
      try {
        let encryptedJwtToken = searchParams.get("jwt_token");
        console.log("Encrypted JWT Token from URL:", encryptedJwtToken);
        if (!encryptedJwtToken) {
          showSnackbar("Missing authentication token", "error");
          navigate("/login");
          return;
        }
        // Fix: decode URI and replace spaces with '+'
        // encryptedJwtToken = decodeURIComponent(
        //   encryptedJwtToken.replace(/ /g, "+")
        // );
        const decodedBytes = atob(base64UrlToBase64(encryptedJwtToken));

        // 2. Convert to string (already a string after atob)
        const encryptedJwt = decodedBytes;

        // 3. Decrypt (assuming your decrypt function is similar to EncryptDecrypt.decrypt)
        const encodedJwt1 = decrypt(encryptedJwt, SECRET_KEY);

        // 4. URL decode the result
        const jwtToken = decodeURIComponent(encodedJwt1);

        if (!jwtToken) {
          showSnackbar("Invalid authentication token", "error");
          navigate("/login");
          return;
        }

        // Check token expiry before proceeding
        if (isTokenExpired(jwtToken)) {
          showSnackbar("Authentication token expired. Please log in again.", "error");
          navigate("/login");
          return;
        }

        const userDetails = jwtDecode(jwtToken);
        console.log("Decoded JWT Token:", userDetails);
        console.log("User ID from JWT:", userDetails.user); // Log the user ID from the JWT

        const response = await axios.get(`${apiURL}/api/users/read_all_users`);
        console.log("API response data:", response.data);

        // Debug: log each user object to see its structure
        if (Array.isArray(response.data)) {
          response.data.forEach((user, idx) => {
            console.log(`User[${idx}]:`, user);
          });
        } else {
          console.error("API did not return an array of users");
          throw new Error("Invalid API response format");
        }

        if (!validateUserData(response.data)) {
          console.error("Validation failed for API user data");
          throw new Error("Invalid user data from API");
        }

        const users = response.data;
        const user = users.find((user) => user.id === userDetails.user);

        if (!user) {
          console.error(
            `User with ID ${userDetails.user} not found in the users array`
          );
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
        // Add team to cookies if present
        if (user.team) {
          Cookies.set("userTeam", user.team, {
            expires: expirationDate,
            secure: true,
          });
        }

        useStore.getState().setUserCookieData({
          token: jwtToken,
          userRole: user.role,
          LoggedIn: "true",
          userEmail: userDetails.emailaddress,
          userId: userDetails.user,
          userName: userDetails.displayname,
          userTeam: user.team || "",
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
