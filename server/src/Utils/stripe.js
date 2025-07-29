import Stripe from 'stripe';
import { config, configDotenv } from 'dotenv';

configDotenv(); // Load environment variables from .env file    
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);