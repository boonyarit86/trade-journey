import { config } from 'dotenv';
config({ path: '.env' });

export const NODE_ENV = process.env.NODE_ENV;
export const NODE_PORT = parseInt(process.env.NODE_PORT, 10);