import express from "express";
import cors from "cors";
import { config as configDotenv } from "dotenv";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import connectToDatabase from "./src/Utils/db.js";
import cron from "node-cron";
import { checkTrialStatuses, handleStripeWebhook } from "./src/Controllers/SubscriptionController.js";

// Routes
import UserRoutes from "./src/Routes/UserRoutes.js";
import BadgeRoutes from './src/Routes/BadgeRoutes.js';
import ActivityRoutes from './src/Routes/ActivityRoutes.js';
import ProfileRoutes from './src/Routes/ProfileRoutes.js';
import TesterRoutes from './src/Routes/TesterRoutes.js';
import AdminRoutes from './src/Routes/AdminRoutes.js';
import SubscriptionRoutes from './src/Routes/SubscriptionRoutes.js';
import ReferralRoutes from './src/Routes/ReferralRoutes.js';
import RewardRoutes from './src/Routes/RewardRoutes.js';
import OpenAIRoutes from './src/Routes/OpenAIRoutes.js';
import parentCoachRoutes from './src/Routes/parentCoachRoutes.js';
import cohortRoutes from './src/Routes/cohortRoutes.js';
import funnelRoutes from './src/Routes/funnelRoutes.js';
import communityRoutes from './src/Routes/communityRoutes.js';
import adminCommunityManageRoutes from './src/Routes/adminCommunityRoutes.js';

configDotenv();

connectToDatabase(process.env.MONGODB_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
app.use(cors());

// Stripe Webhook - raw body
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Parsing
app.use(bodyParser.json());
app.use(express.json());

// Static uploads path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cron Jobs
cron.schedule('0 0 * * *', () => {
    console.log('Checking trial statuses...');
    checkTrialStatuses();
});

// Test Routes
app.get('/api/test', (_req, res) => {
    res.json({
        message: "Server is working fine",
        time: new Date().toISOString(),
    });
});

app.get('/api/health', (_req, res) => {
    res.json({
        status: "healthy",
        server: "live"
    });
});

// Route Registry
app.use('/api', UserRoutes);
app.use('/api', BadgeRoutes);
app.use('/api', ActivityRoutes);
app.use('/api', ProfileRoutes);
app.use('/api', TesterRoutes);
app.use('/api', AdminRoutes);
app.use('/api', SubscriptionRoutes);
app.use('/api', ReferralRoutes);
app.use('/api', RewardRoutes);
app.use('/api/', OpenAIRoutes);
app.use('/api', parentCoachRoutes);
app.use('/api', cohortRoutes);
app.use('/api', funnelRoutes);
app.use('/api', communityRoutes);
app.use('/api', adminCommunityManageRoutes);

// Error Handler
app.use((err, _req, res, _next) => {
    console.error("Error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"
    });
});

export default app;
