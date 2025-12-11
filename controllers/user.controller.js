import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  const { fullname, email, password, phoneNumber, role } = req.body;
  if (!fullname || !email || !password || !phoneNumber || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const file = req.files?.profilePhoto?.[0];

  const fileUri = getDataUri(file);
  const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      },
    });
    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not exist" });
    }

    const decodePassword = await bcrypt.compare(password, user?.password);
    if (!decodePassword) {
      return res.status(400).json({ message: "incorrect password" });
    }

    if (role !== user.role) {
      return res.status(400).json({ message: "incorrect role" });
    }

    const tokenData = {
      userId: user._id,
      // role: user.role
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logut successfully",
    });
  } catch (error) {
    console.log("Error in logout", error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const files = req.files;

    const profilePhotoFile = files?.profilePhoto?.[0];
    const resumeFile = files?.resume?.[0];

    const userId = req.id;

    let skillsArray = [];
    if (skills) {
      skillsArray =
        typeof skills === "string"
          ? skills.split(",").map((s) => s.trim())
          : skills.map((s) => s.trim());
    }

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.profile) user.profile = {};

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    // -------------------------------
    // Upload profile photo (IMAGE)
    // -------------------------------
    // 📌 PROFILE PHOTO UPDATE
    if (profilePhotoFile) {
      const fileUri = getDataUri(profilePhotoFile);
      const cloudRes = await cloudinary.uploader.upload(fileUri.content);
      user.profile.profilePhoto = cloudRes.secure_url;
    }
    // -------------------------------
    // Upload resume (PDF → RAW)
    // -------------------------------
    if (resumeFile) {
      const fileUri = getDataUri(resumeFile);

      const cloudRes = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "raw", // IMPORTANT for PDF
        folder: "resumes",
        use_filename: true,
        unique_filename: false,
        type: "upload",
        filename_override: resumeFile.originalname,
      });

      user.profile.resume = cloudRes.secure_url;
      user.profile.resumeOriginalName = resumeFile.originalname;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in Profile update:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
