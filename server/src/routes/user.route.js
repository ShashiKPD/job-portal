import {Router} from 'express';
import {registerUser, loginUser, verifyOTP} from '../controllers/user.controller.js';
const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-otp").post(verifyOTP); 

export default router;