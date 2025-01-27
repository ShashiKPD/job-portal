import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan";

const app = express();

// Use Morgan for logging
const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  app.use(morgan("combined")); // Detailed logs for production
} else {
  app.use(morgan("dev")); // Minimal logs for development
}

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

import userRouter from "./routes/user.route.js"
import jobRouter from "./routes/job.route.js"
import healthcheckRouter from "./routes/healthcheck.route.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/jobs", jobRouter)
app.use("/api/v1/health-check", healthcheckRouter)

// Middleware to handle invalid JSON errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Invalid JSON payload:", err.body);
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format. Please check your request body.",
      error: err.message,
    });
  }
  next(err);
});

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

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
  });
});

export { app }
