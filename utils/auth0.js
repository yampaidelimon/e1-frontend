import axios from 'axios';
import { getSession } from '@auth0/nextjs-auth0';


export const getManagementAPIToken = async () => {
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

export const getUserId = async (accessToken, userSub) => {
  const userResponse = await axios.get(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${userSub}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const updatedUserData = userResponse.data;
  const userId = updatedUserData.identities[0].user_id;

  return userId;
}