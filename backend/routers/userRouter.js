import express from "express";
import {signUP, signIN, signOut, getProfile, updateProfile} from "../controllers/userController.js";
import {toggleDonorStatus} from "../controllers/toggleStatus.js";
import { requestBlood } from "../controllers/requestBlood.js";
import { UserMiddleware } from "../middlewares/authMiddleware.js";
// import authMiddleware from "../middlewares/authMiddleware.js"


const router = express.Router();

router.post("/signup", signUP);
router.post("/signin", signIN);
router.post("/signout", signOut);
router.post("/toggledonorstatus",toggleDonorStatus);
router.post("/request", requestBlood);
router.get("/profile", UserMiddleware, getProfile);
router.put("/profile", UserMiddleware, updateProfile);
export default router;
