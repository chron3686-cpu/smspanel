// NovaText Cloud - SMS API Configuration
// API credentials are stored securely on the backend only

export const SMS_API = {
  baseUrl: 'https://didlogic.com/api/v2/sms',
  apiKey: 'ce10d3706c84619384e0d3b948900855315acfd145c0a7edea6a4bf216e8a18e',
  defaultSource: '+1234567890' // Default sender ID
};

export const getApiUrl = () => {
  return `${SMS_API.baseUrl}?api_token=${SMS_API.apiKey}`;
};

