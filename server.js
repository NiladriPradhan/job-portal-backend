import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ConnectDB } from "./ConnectDB/ConnectDB.js";
import User from "./model/userModel.js";
import userRouter from "./routes/user.route.js";
import companyRouter from "./routes/company.route.js";
import jobRouter from "./routes/job.route.js";
import applicationRouter from "./routes/application.route.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "home page of job portal - backend 5000",
  });
});

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// 🟡 Handles user-related operations, such as:
// Register, Login, Update profile, Get user details
// 👉 Everything related to auth and user management.
app.use("/api/v1/user", userRouter);
// 🟡 Handles company-related operations, such as:
// Create company, Update company, Get company list, Get company by ID
// 👉 Used by recruiters/admin to manage their organizations.
app.use("/api/v1/company", companyRouter);
// 🟡 Handles job-related operations, such as:
// Post a job, Get all jobs, Get job by ID
// Get all jobs posted by an admin
// 👉 Used to create and view job postings.
app.use("/api/v1/job", jobRouter);
// 🟡 Handles job application operations, such as:
// Apply for a job, Get user applications,View applications for a job,Update application status
// 👉 Used by students/applicants and recruiters.
app.use("/api/v1/application", applicationRouter);

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({
        success: false,
        message: "no users found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "home page of backend 5000",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "error in get user info",
      error,
    });
  }
});
ConnectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });
