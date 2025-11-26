import express from "express";
import cors from "cors";
import { config as configDotenv } from "dotenv";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';
import connectToDatabase from "./src/Utils/db.js";
import prerender from "prerender-node";

import UserRoutes from "./src/Routes/UserRoutes.js";
import BadgeRoutes from './src/Routes/BadgeRoutes.js'
import ActivityRoutes from './src/Routes/ActivityRoutes.js'
import ProfileRoutes from './src/Routes/ProfileRoutes.js'
import TesterRoutes from './src/Routes/TesterRoutes.js'
import AdminRoutes from './src/Routes/AdminRoutes.js'
import SubscriptionRoutes from './src/Routes/SubscriptionRoutes.js'
import { checkTrialStatuses, handleStripeWebhook } from "./src/Controllers/SubscriptionController.js";

import ReferralRoutes from './src/Routes/ReferralRoutes.js'
import RewardRoutes from './src/Routes/RewardRoutes.js'
import OpenAIRoutes from './src/Routes/OpenAIRoutes.js'
import parentCoachRoutes from './src/Routes/parentCoachRoutes.js'
import cohortRoutes from './src/Routes/cohortRoutes.js'
import funnelRoutes from './src/Routes/funnelRoutes.js'

import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();

connectToDatabase(process.env.MONGODB_URL);

const app = express();

// if (process.env.NODE_ENV === 'production') {
//     app.set('trust proxy', 1);
// }

// app.use(prerender.set("prerenderToken", process.env.PRERENDER_TOKEN));

// CORS Configuration - Simplified for JWT only
// app.use(cors({
//     origin: [
//         "https://eensterkestart.nl",
//         "https://admin.eensterkestart.nl",
//         "https://api.eensterkestart.nl",
//         "http://localhost:4001",
//         "http://localhost:4002",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     credentials: false,
//     optionsSuccessStatus: 200,
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Timezone'],
// }));

app.use(cors())

// Stripe webhook - needs raw body
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(bodyParser.json());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

cron.schedule('0 0 * * *', () => {
    console.log('Checking trial statuses...');
    checkTrialStatuses();
});

// Remove session middleware since we're only using JWT

app.get('/api/test', (req, res) => {
    res.status(200).json({ 
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        server: 'online',
        database: 'connected',
        cors: 'enabled',
        auth: 'JWT Bearer tokens only'
    });
});

app.use('/api', UserRoutes);
app.use('/api', BadgeRoutes);
app.use('/api', ActivityRoutes);
app.use('/api', ProfileRoutes);
app.use('/api', TesterRoutes);
app.use('/api', AdminRoutes);
app.use('/api', SubscriptionRoutes);
app.use('/api', ReferralRoutes);
app.use('/api', RewardRoutes);
app.use('/api', OpenAIRoutes);
app.use("/api", parentCoachRoutes);
app.use("/api", cohortRoutes)
app.use("/api", funnelRoutes)



app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 4008;

app.listen(PORT, '0.0.0.0', () => {
    // function getServerIp() {
    //     const networkInterf = networkInterfaces();
    //     for (const interfaceName in networkInterf) {
    //         const interf = networkInterf[interfaceName];
    //         for (const alias of interf) {
    //             if (alias.family === 'IPv4' && !alias.internal) {
    //                 return alias.address;
    //             }
    //         }
    //     }
    //     return 'Unknown IP';
    // }
    
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS enabled - JWT Bearer tokens only`);
    console.log(`Authentication: JWT only - No sessions/cookies`);
});