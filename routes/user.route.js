import express from "express";
import {
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload, uploadFields } from "../middleware/multer.js";

const router = express.Router();

// For register (single file upload)
router.post(
  "/register",
  upload.fields([{ name: "profilePhoto", maxCount: 1 }]),
  register
);

// Login & Logout
router.post("/login", login);
router.get("/logout", logout);

router.post("/profile/update", isAuthenticated, uploadFields, updateProfile);

export default router;
