import express from 'express';
import { findNearbyEligibleDonors } from '../controllers/donorController.js';
import { UserMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/', UserMiddleware, findNearbyEligibleDonors);

export default router;