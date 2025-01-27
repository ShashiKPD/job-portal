import express from "express"
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

import userRouter from "./routes/user.route.js"
import jobRouter from "./routes/job.route.js"
import healthcheckRouter from "./routes/healthcheck.route.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/jobs", jobRouter)
app.use("/api/v1/health-check", healthcheckRouter)

import { ApiError } from "./utils/ApiError.js"
app.use((err, req, res, next) => {
  console.log(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: err.success,
      message: err.message,
      errors: err.errors,
      // stack: err.stack
    });
  }

  console.error(err); // Log the error
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
  });
});

export { app }
