import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/UI/spinner";
import Cookies from "js-cookie";
import showSnackbar from "../utils/showSnackbar";
import generateEmployeeCode from "../utils/employeeToken";
import DOMPurify from "dompurify";
import { jwtDecode } from "jwt-decode";
import useStore from "../store/useStore"; // Add this import

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function DefaultLogin() {
  const [role, setRole] = useState("");
  const [team, setTeam] = useState(""); // Add team state
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [shakeForm, setShakeForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const login = auth?.login;
  const navigate = useNavigate();
  const clearUserCookieData = useStore((state) => state.clearUserCookieData); // Add this line

  // Show error if AuthContext is not available
  if (!auth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md mt-8 text-center">
          <h1 className="text-2xl text-white mb-6">Authentication Error</h1>
          <p className="text-red-500">
            AuthContext is not available. Please ensure the AuthProvider wraps
            this component.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Clear any persisted userCookies/auth state before login
    clearUserCookieData();
    if (validateForm()) {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("username", role); // Use role as username for backend
        params.append("password", password);
        // Optionally, send team to backend if needed:
        params.append("team", team);

        const response = await axios.post(`${apiURL}/api/token`, params);
        let { access_token } = response.data;

        // Check if access_token exists, otherwise show error
        if (!access_token) {
          showSnackbar("Incorrect role or password", "warning");
          setMessage("Incorrect role or password");
          setShakeForm(true);
          setTimeout(() => setShakeForm(false), 600);
          setLoading(false);
          return;
        }

        access_token = DOMPurify.sanitize(access_token);
        const decodedToken = jwtDecode(access_token);
        const username = role;
        const employeecode = generateEmployeeCode(username);
        const email = `${employeecode}@mahindra.com`;

        login(
          decodedToken.role,
          username,
          email,
          employeecode,
          access_token,
          team // Pass team to login
        );
        showSnackbar("Login successful", "success");

        setMessage("Login successful. Redirecting...");
        navigate("/home"); // Redirect immediately
      } catch (error) {
        // Show a generic error if something else went wrong
        showSnackbar("An error occurred during login", "warning");
        setMessage("An error occurred during login");
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 600);
      } finally {
        setLoading(false);
      }
    }
  };

  function validateForm() {
    return (
      role.trim().length > 0 &&
      password.trim().length > 0 &&
      team.trim().length > 0 // Require team
    );
  }

  return (
    <>
      <Spinner loading={loading} />
      <div className="bg-gray-800 min-h-screen flex flex-col">
        <div className="flex items-center justify-center my-auto">
          <div
            className={`${
              shakeForm ? "animate-shake" : ""
            } bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md mt-8`}
          >
            <h1 className="text-2xl text-white mb-6 text-center">Log In</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <p className="text-white mb-2">Role</p>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </label>
              <label className="block">
                <p className="text-white mb-2">Password</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </label>
              <label className="block">
                <p className="text-white mb-2">Team</p>
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select team
                  </option>
                  <option value="vtc">VTC_CHENNAI</option>
                  <option value="vtc_n">VTC_NASHIK</option>
                  <option value="rde">RDE</option>
                  <option value="pdcd">PDCD</option>
                </select>
              </label>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  Submit
                </button>
              </div>
            </form>
            {message && (
              <p
                className={`mt-4 text-center ${
                  message === "Login successful. Redirecting..."
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}