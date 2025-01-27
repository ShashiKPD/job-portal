import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js";
import { createJob, getAllJobs, getJobsByCompany, addOrRemoveCandidate,sendJobAlerts } from "../controllers/job.controller.js";

const router = Router();

router.route("/").get(getAllJobs);
router.route("/company/:username").get(getJobsByCompany);

router.route("/create").post(verifyJwt, createJob);
router.route("/:jobId/candidate").put(verifyJwt, addOrRemoveCandidate);
router.route("/send-alerts/:jobId").post(verifyJwt, sendJobAlerts);

export default router;