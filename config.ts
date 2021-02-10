import { DotenvConfigOutput, config } from 'dotenv';
require('custom-env').env(true)

const envFound: DotenvConfigOutput = config();

if (!envFound) {
  throw new Error('.env file was not found.');
}

// export const NODE_ENV: any = String(process.env.NODE_ENV) || 'development';
export const port: any = Number(process.env.port) || 3000;


export const DATABASE_TYPE: any = String(process.env.DATABASE_TYPE) || 'postgres';
export const DATABASE_USERNAME: any = String(process.env.DATABASE_USERNAME) || 'postgres';
export const DATABASE_PASSWORD: any = String(process.env.DATABASE_PASSWORD) || '123Tim1234';
export const DATABASE_HOST: any = String(process.env.DATABASE_HOST) || 'database-1.cnja4q398tj1.us-west-2.rds.amazonaws.com';
export const DATABASE_PORT: any = Number(process.env.DATABASE_PORT) || 5432;
export const DATABASE_NAME: any = String(process.env.DATABASE_NAME) || 'smartupdev';
export const GROUP_MICROSERVICE_URI: any = 'http://localhost:3000'
export const REDIS_HOST: any = String(process.env.REDIS_HOST) || 'localhost'
export const REDIS_PORT: any = String(process.env.REDIS_PORT) || 6379
export const CACHE_TTL: any = String(process.env.CACHE_TTL) || 7890000  // Set default TTL for cache in 3 months
// export const DATABASE_SYNCHRONIZE: any = Boolean(process.env.DATABASE_SYNCHRONIZE) || true;

export const STRIPE_LIVE_KEY: string = String(process.env.STRIPE_LIVE_KEY) || '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';
export const STRIPE_SECRET_KEY: string = String(process.env.STRIPE_SECRET_KEY) || 'sk_test_51HmFd5LnHAQX7qrjcr5XCpGWSMazzAlZEfm8Vaae6kzMpkBEcT5kyfkvSAHsqrCLxngUMRKiSLTLBvNcf0p4W4oc00FYFlasY8';
export const STRIPE_PUBLISHABLE_LIVE_KEY: string = String(process.env.STRIPE_PUBLISHABLE_LIVE_KEY)
export const STRIPE_PUBLISHABLE_TEST_KEY: string = String(process.env.STRIPE_PUBLISHABLE_TEST_KEY)
export const STRIPE_API_VERSION: any = String(process.env.STRIPE_API_VERSION) || '2020-08-27';


export const AWS_ACCESS_KEY: string = String(process.env.AWS_ACCESS_KEY) || "AKIA5VA4PNH4BNPYVNMG";
export const AWS_SECRET_ACCESS_KEY: string = String(process.env.AWS_SECRET_ACCESS_KEY) || "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";
export const AWS_REGION: string = String(process.env.AWS_REGION) || "us-east-2";
export const AWS_LOGGER_SQS_URL: string = String(process.env.AWS_LOGGER_SQS_URL) || "https://sqs.us-east-2.amazonaws.com/938510084600/smartup_dev_logs";



export const MAIL_HOST :string = '127.0.0.1'
export const MAIL_PORT:any = 3000
export const MAIL_TLS :any = true
export const MAIL_SECURE :any = false
