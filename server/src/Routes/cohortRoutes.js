import express from 'express';
import { getChurnAnalysis, getRetentionCohorts, getUserEngagementMetrics } from '../Controllers/cohortController.js';

const router = express.Router();

/**
 * GET /api/analytics/retention-cohorts
 * Query params:
 * - cohortType: 'weekly' or 'monthly' (default: 'weekly')
 * - startDate: ISO date string (default: 90 days ago)
 * - endDate: ISO date string (default: today)
 * - segmentBy: 'ageGroup', 'learningDomain', etc. (optional)
 */
router.get('/retention-cohorts', getRetentionCohorts);

/**
 * GET /api/analytics/engagement-metrics
 * Query params:
 * - startDate: ISO date string (default: 30 days ago)
 * - endDate: ISO date string (default: today)
 */
router.get('/engagement-metrics', getUserEngagementMetrics);

/**
 * GET /api/analytics/churn-analysis
 * Query params:
 * - daysInactive: number of days to consider inactive (default: 14)
 */
router.get('/churn-analysis', getChurnAnalysis);

export default router;