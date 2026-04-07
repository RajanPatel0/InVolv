import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.EMAIL_CLIENT_ID,
    process.env.EMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // redirect URI for playground
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.EMAIL_REFRESH_TOKEN,
  });

  const accessTokenResponse = await oauth2Client.getAccessToken();
  const accessToken = accessTokenResponse?.token || accessTokenResponse;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.EMAIL_CLIENT_ID,
      clientSecret: process.env.EMAIL_CLIENT_SECRET,
      refreshToken: process.env.EMAIL_REFRESH_TOKEN,
      accessToken: accessToken,  
    },
  });

  return transporter;
};

export default createTransporter;