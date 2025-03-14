import express from 'express';
import { findNearbyEligibleDonors } from '../controllers/donorController.js';
import { UserMiddleware } from '../middlewares/authMiddleware.js';
import { geoCode } from '../middlewares/geoCode.js';
const router = express.Router();

router.post('/', UserMiddleware, geoCode, findNearbyEligibleDonors);

export default router;