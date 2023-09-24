import React, { useState } from 'react';
import axios from 'axios';
import { getSession } from '@auth0/nextjs-auth0';

import { getUserId } from '../utils/auth0';


export default function BalanceComponent(props) {
	const { balance, user, accessToken, auth0_issuer_base_url, userId, serverEndpoint } = props;
	console.log(props);

	const [amount, setAmount] = useState('');
	const [localBalance, setLocalBalance] = useState(balance);
	const [message, setMessage] = useState('');

	const handleAmountChange = (e) => {
		setAmount(e.target.value);
	};

	const handleLoadBalance = () => {
		const floatAmount = parseFloat(amount);
		if (Number.isInteger(floatAmount) && floatAmount > 0) {
			const updatedBalance = localBalance + floatAmount;
			updateUserMetadata(updatedBalance);
		} else {
			setMessage('Por favor, ingresa una cantidad entera positiva.');
		}
	};

	const handleWithdrawBalance = () => {
		const floatAmount = parseFloat(amount);
		if (floatAmount > 0 && floatAmount <= localBalance) {
			const updatedBalance = localBalance - floatAmount;
			updateUserMetadata(updatedBalance);
		} else {
			setMessage('Cantidad inválida para retirar.');
		}
	};

	const updateUserMetadata = async (updatedBalance) => {
		try {
			const response = await axios.patch(`${serverEndpoint}/edit-wallet`, 
				{
					userId: userId,
					newBalance: updatedBalance
				},
				{
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (response.status !== 200)
				throw new Error(`Received status code ${response.status}`);

			setMessage(`Tu saldo actualizado es: $${updatedBalance}`);
			setLocalBalance(updatedBalance);
		} catch (error) {
			const errorMessage = error.response ? `${error.response.data.error}: ${error.response.data.message}` : error.message;
			setMessage(`Error: ${errorMessage}`);
			console.error('Error updating user metadata:', errorMessage);
		}
	};


	return (
		<div>

			<h2>Tu saldo es: ${localBalance.toFixed(2)}</h2>

			<input
				type="number"
				value={amount}
				onChange={handleAmountChange}
				placeholder="Ingresa una cantidad"
			/>
			<button onClick={handleLoadBalance}>Cargar Saldo</button>
			<button onClick={handleWithdrawBalance}>Retirar Saldo</button>
			{message && <div>{message}</div>}
		</div>
	);
}


const getManagementAPIToken = async (context) => {

	const tokenURL = `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`;
	const payload = {
		client_id: process.env.AUTH0_CLIENT_ID,
		client_secret: process.env.AUTH0_CLIENT_SECRET,
		audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
		grant_type: "client_credentials"
	};

	const response = await axios.post(tokenURL, payload);
	return response.data.access_token;
};


export async function getServerSideProps(context) {
	const accessToken = await getManagementAPIToken(context);
	const session = await getSession(context.req, context.res);
	const user = session?.user;

	const userId = await getUserId (accessToken, user.sub);
	
	const response = await axios.get(`${process.env.SERVER_ENDPOINT}/my-wallet`, {
		headers: {
			'Content-Type': 'application/json'
		},
		params: {
			userId: userId
		}
	});
	const myWallet = response.data;
	const { balance } = myWallet;

	// Pasar el balance y el token de acceso
	return {
		props: {
			balance,
			user: user || null,
			userId: userId,
			accessToken: accessToken,
			auth0_issuer_base_url: process.env.AUTH0_ISSUER_BASE_URL,
			serverEndpoint: process.env.SERVER_ENDPOINT
		}
	};
}



