import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jwtDecode from "jwt-decode";
import Spinner from '../components/UI/Spinner';
import Cookies from 'js-cookie';
import showSnackbar from '../utils/showSnackbar';
import generateEmployeeCode from "../utils/employeeToken";
import DOMPurify from 'dompurify';

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function DefaultLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [teamType, setTeamType] = useState('');
  const [teamLocation, setTeamLocation] = useState('');
  const [message, setMessage] = useState('');
  const [shakeForm, setShakeForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await axios.post(`${apiURL}/token`, params);
        let { access_token } = response.data;
        access_token = DOMPurify.sanitize(access_token);
        const decodedToken = jwtDecode(access_token);

        // Generate employee code based on username
        const employeecode = generateEmployeeCode(decodedToken.username);
        const email = `${decodedToken.username}test@mahindra.com`;

        // Update authentication context with decoded token data
        login(decodedToken.role, decodedToken.username, email, employeecode, teamType, teamLocation, access_token);

        setMessage('Login successful. Redirecting...');
        setTimeout(() => {
          navigate('/home?tab=viewjoborders');
        }, 1000);
      } catch (error) {
        showSnackbar('Incorrect username or password', 'warning');
        setMessage('Incorrect username or password');
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 600);
      } finally {
        setLoading(false);
      }
    }
  };

  function validateForm() {
    return (
      username.trim().length > 0 &&
      password.trim().length > 0 &&
      teamType !== '' &&
      teamLocation !== ''
    );
  }

  return (
    <>
      <Spinner loading={loading} />
      <div className="bg-gray-800 min-h-screen flex flex-col">
        <div className="flex items-center justify-center my-auto">
          <div
            className={`${
              shakeForm ? 'animate-shake' : ''
            } bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md mt-8`}
          >
            <h1 className="text-2xl text-white mb-6 text-center">Log In</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <p className="text-white mb-2">User ID</p>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                <p className="text-white mb-2">Team Type</p>
                <select
                  value={teamType}
                  onChange={(e) => setTeamType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="" disabled>Select Team Type</option>
                  <option value="RDE">RDE</option>
                  <option value="VTC">VTC</option>
                </select>
              </label>
              <label className="block">
                <p className="text-white mb-2">Team Location</p>
                <select
                  value={teamLocation}
                  onChange={(e) => setTeamLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="" disabled>Select Team Location</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Nashik">Nashik</option>
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
                  message === 'Login successful. Redirecting...'
                    ? 'text-green-500'
                    : 'text-red-500'
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