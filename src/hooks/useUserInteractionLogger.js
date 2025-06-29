import { useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import useStore from '../store/useStore';

const apiURL = import.meta.env.VITE_BACKEND_URL;

const logUserInteraction = async (interaction, employeeId, userName) => {
	// const sessionId = Cookies.get('session_id') || uuidv4(); // Get from cookies or generate a new one
	const sessionId = uuidv4(); // Get from cookies or generate a new one
	try {
		await axios.post(
			`${apiURL}/logger/log`,
			{
				interaction,
				employee_id: employeeId,
			},
			{
				headers: {
					'X-Session-ID': sessionId,
					'X-Display-Name': userName,
					'X-Token-Number': employeeId,
				},
			}
		);
	} catch (error) {
		console.error('Error logging user interaction:', error);
	}
};

const useUserInteractionLogger = () => {
	// const { userName, userEmployeeId } = useAuth();
	// Fetch user data directly from cookies
	const userCookies = useStore.getState().getUserCookieData();
	const userName = userCookies.userName;
	const userEmployeeId = userCookies.userEmployeeId;
	const logInteraction = useCallback(
		(interaction) => {
			logUserInteraction(interaction, userEmployeeId, userName);
		},
		[userEmployeeId, userName]
	);

	return { logInteraction };
};

export default useUserInteractionLogger;
