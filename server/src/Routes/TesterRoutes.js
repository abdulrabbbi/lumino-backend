import express from 'express'
import { authenticate } from '../Middleware/Authenticate.js';
import { submitTesterForm } from '../Controllers/TesterController.js';
const router = express.Router();

router.post('/submit-tester-form', authenticate, submitTesterForm);

export default router