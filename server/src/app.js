import express from "express"

const app = express();

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

import userRouter from "./routes/user.route.js"

app.use("/api/v1/users", userRouter)

export { app }
