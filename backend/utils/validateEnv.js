import logger from './logger.js';

const REQUIRED_VARS = [
  'JWTPRIVATEKEY',
  'DB_URI', // or DB_URL — see note below
];

const RECOMMENDED_VARS = [
  'FRONTEND_URL',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key] && !process.env[key.replace('DB_URI', 'DB_URL')]);

  if (missing.length > 0) {
    logger.fatal(`Missing required environment variable(s): ${missing.join(', ')}`);
    process.exit(1);
  }

  const missingRecommended = RECOMMENDED_VARS.filter((key) => !process.env[key]);
  if (missingRecommended.length > 0) {
    logger.warn(`Missing recommended environment variable(s): ${missingRecommended.join(', ')} — some features (image uploads, CORS) may not work.`);
  }
}

export default validateEnv;