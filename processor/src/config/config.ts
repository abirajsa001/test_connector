export const config = {
  // Required by Payment SDK
  projectKey: process.env.CTP_PROJECT_KEY || 'projectKey',
  clientId: process.env.CTP_CLIENT_ID || 'xxx',
  clientSecret: process.env.CTP_CLIENT_SECRET || 'xxx',
  jwksUrl: process.env.CTP_JWKS_URL || 'https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json',
  jwtIssuer: process.env.CTP_JWT_ISSUER || 'https://mc-api.europe-west1.gcp.commercetools.com',
  authUrl: process.env.CTP_AUTH_URL || 'https://auth.europe-west1.gcp.commercetools.com',
  apiUrl: process.env.CTP_API_URL || 'https://api.europe-west1.gcp.commercetools.com',
  sessionUrl: process.env.CTP_SESSION_URL || 'https://session.europe-west1.gcp.commercetools.com/',
  healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000'),

  // Required by logger
  loggerLevel: process.env.LOGGER_LEVEL || 'info',

  // Payment Providers config
  novalnetEnvironment: process.env.NOVALNET_ENVIRONMENT || 'TEST',
  novalnetVendorId: process.env.NOVALNET_VENDOR_ID || 'novalnetVendorId',
  novalnetAuthCode: process.env.NOVALNET_AUTH_CODE || 'novalnetAuthCode',
  novalnetProductId: process.env.NOVALNET_PRODUCT_ID || 'novalnetProductId',
  novalnetAccessKey: process.env.NOVALNET_ACCESS_KEY || 'novalnetAccessKey',
  novalnetPaymentAccessKey: process.env.NOVALNET_PAYMENT_ACCESS_KEY || 'novalnetPaymentAccessKey',
  novalnetTariffId: process.env.NOVALNET_TARIFF_ID || '',
  novalnetTestMode: process.env.NOVALNET_TEST_MODE === 'true',
  merchantReturnUrl: process.env.MERCHANT_RETURN_URL || '',
};
export const getConfig = () => {
  return config;
};
