import express from 'express'
import { getFunnelData } from '../Controllers/funnelController.js'


const router = express.Router()

router.get("/get-funnel-data", getFunnelData)

export default router