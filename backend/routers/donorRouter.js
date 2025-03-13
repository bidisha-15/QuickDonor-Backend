import express from 'express';
import { findNearbyDonors } from '../controllers/donorController.js';
import { UserMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/', UserMiddleware, findNearbyDonors);

export default router;