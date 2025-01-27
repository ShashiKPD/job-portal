import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js";
import { createJob, getAllJobs, getJobsByCompany, addOrRemoveCandidate } from "../controllers/job.controller.js";

const router = Router();


router.route("/create").post(verifyJwt, createJob);
router.route("/:jobId/candidate").put(verifyJwt, addOrRemoveCandidate);

router.route("/").get(getAllJobs);
router.route("/company/:username").get(getJobsByCompany);

export default router;