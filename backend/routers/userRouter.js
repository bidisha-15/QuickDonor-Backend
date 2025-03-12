import express from "express";
import {signUP, signIN, signOut} from "../controllers/userController.js";
const router = express.Router();

router.post("/signup", signUP);
router.post("/signin", signIN);
router.get("/signout", signOut);
export default router;
