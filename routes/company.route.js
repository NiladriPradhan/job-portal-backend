import express from "express";
import {
  getCompany,
  getCompanyById,
  registerCompany,
  updateCompanyById,
} from "../controllers/company.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post(
  "/register",
  isAuthenticated,
  upload.single("logo"), // <---- VERY IMPORTANT
  registerCompany
);
// router.route("/register").post(isAuthenticated, registerCompany);
router.route("/get").get(isAuthenticated, getCompany);
router.route("/:id").get(isAuthenticated, getCompanyById);
router
  .route("/update/:id")
  .put(isAuthenticated, upload.single("logo"), updateCompanyById);

export default router;
