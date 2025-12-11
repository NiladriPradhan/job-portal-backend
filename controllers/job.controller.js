import mongoose from "mongoose";
import Job from "../model/jobModel.js";

// recruiter/admin can post job
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      experience,
      location,
      jobType,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !position ||
      !companyId
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const job = {
      title,
      description,
      requirements: requirements.split(",").map((r) => r.trim()),
      salary,
      experiencelevel: experience,
      location,
      jobType,
      position,
      company: companyId,
      created_by: userId,
    };

    const newJob = await Job.create(job);

    return res.status(201).json({
      message: "Job created successfully",
      newJob,
      success: true,
    });
  } catch (error) {
    console.log("error in create job post", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// student can show all jobs
export const getAllJob = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    const jobs = await Job.find(query)
      .populate({
        //We use populate() to automatically replace a referenced ObjectId with the actual full document from another collection.
        path: "company",
      })
      .sort({ createdAt: -1 });

    if (!jobs) {
      return res.status(200).json({
        message: "Jobs not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Jobs found successfully",
      jobs,
      success: true,
    });
  } catch (error) {
    console.log("error in get all job", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// student can show job by ID
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId)
      .populate("company") // <- Load company details
      .populate("applications"); // (optional)

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job found successfully",
      job,
      success: true,
    });
  } catch (error) {
    console.log("error in get jobById", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// jobs created by admin/recruiter

export const getAdminJob = async (req, res) => {
  try {
    const adminId = req.id;
    console.log("Admin ID:", adminId);

    // Fetch jobs created by this admin
    const jobs = await Job.find({ created_by: adminId })
      .populate("company")
      .sort({ createdAt: -1 });

    console.log("Jobs Returned:", jobs);

    return res.status(200).json({
      jobs,
      success: true
    });
  } catch (error) {
    console.log("error in getAdminJob", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
