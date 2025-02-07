import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth.middleware.js';
import {registerUser, verifyOTP, regenerateOtp, loginUser, logoutUser, refreshAccessToken, getUser} from '../controllers/user.controller.js';
const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-otp").post(verifyOTP); 
router.route("/regenerate-otp").post(regenerateOtp);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJwt, logoutUser);
router.route("/me").get(verifyJwt, getUser);

export default router;