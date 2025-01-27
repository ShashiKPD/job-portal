import {Router} from 'express';
import {registerUser, verifyOTP, regenerateOtp, loginUser, logoutUser} from '../controllers/user.controller.js';
const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-otp").post(verifyOTP); 
router.route("/regenerate-otp").post(regenerateOtp);
router.route("/logout").post(logoutUser);

export default router;