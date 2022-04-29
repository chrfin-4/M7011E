const path = require('path');

const notSet = (env) => { throw new Error('env not set: ' + env); }

// Mandatory environment variables validation
if (!process.env.MONGO_CONNECTION) notSet('MONGO_CONNECTION');
if (!process.env.CRYPT_KEY) notSet('CRYPT_KEY');

// Defaults
const SIM_ENDPOINT = (process.env.SIM_ENDPOINT) ? process.env.SIM_ENDPOINT : "http://localhost:8081/graphql";
const CORS_ORIGIN = (process.env.CORS_ORIGIN) ? process.env.CORS_ORIGIN : "http://localhost:3000";
const UPLOADS_DIR = (process.env.UPLOADS_DIR) ? process.env.UPLOADS_DIR : "./uploads";
const REDIS_HOST = (process.env.REDIS_HOST) ? process.env.REDIS_HOST : "127.0.0.1";
const REDIS_PORT = (process.env.REDIS_PORT) ? process.env.REDIS_PORT : 6379;
const REDIS_PASSWORD = (process.env.REDIS_PASSWORD) ? process.env.REDIS_PASSWORD : null;
const SRV_PORT = (process.env.SRV_PORT) ? process.env.SRV_PORT : 8080;

const UPLOADS_PATH = (!UPLOADS_DIR.startsWith('/')) ? path.join(__dirname, '..', UPLOADS_DIR) : UPLOADS_DIR;

module.exports = {
  __prod__: process.env.NODE_ENV === "production",
  COOKIE_NAME: "qid",
  FORGET_PASSWORD_PREFIX: "forget-password:",
  PROD_DOMAIN_NAME: "exerge.akerstrom.dev",

  // Enviromnment
  MONGO_CONNECTION: process.env.MONGO_CONNECTION,
  CRYPT_KEY: process.env.CRYPT_KEY,
  SIM_ENDPOINT: SIM_ENDPOINT,
  CORS_ORIGIN: CORS_ORIGIN,
  SRV_PORT: SRV_PORT,
  REDIS_HOST: REDIS_HOST,
  REDIS_PORT: REDIS_PORT,
  REDIS_PASSWORD: REDIS_PASSWORD,
  UPLOADS_PATH: UPLOADS_PATH
}; 