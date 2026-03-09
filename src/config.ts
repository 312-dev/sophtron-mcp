import dotenv from 'dotenv';
dotenv.config();

export default {
  SophtronApiUserId: process.env.SOPHTRON_USER_ID || '',
  SophtronApiUserSecret: process.env.SOPHTRON_ACCESS_KEY || '',
  ApiServiceEndpoint: process.env.SOPHTRON_API_ENDPOINT || 'https://api.sophtron.com/api',
  CustomerName: process.env.SOPHTRON_CUSTOMER_NAME || '',
  ServerName: 'sophtron-mcp',
  ServerVersion: '1.0.0',
};
