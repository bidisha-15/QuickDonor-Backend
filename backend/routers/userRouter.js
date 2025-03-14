import express from "express";
import {signUP, signIN, signOut} from "../controllers/userController.js";
import {toggleDonorStatus} from "../controllers/toggleStatus.js";
import { requestBlood } from "../controllers/requestBlood.js";
// import authMiddleware from "../middlewares/authMiddleware.js"


const router = express.Router();

router.post("/signup", signUP);
router.post("/signin", signIN);
router.get("/signout", signOut);
router.post("/toggledonorstatus",toggleDonorStatus);
router.post("/request", requestBlood);
export default router;
