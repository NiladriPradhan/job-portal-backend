import Application from "../model/applicationSchema.js";
import Job from "../model/jobModel.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required",
        success: false,
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId).populate({
      path: "applications",
      //   populate: { path: "applicant", select: "_id name email" },
    });
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    // Create application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();

    return res.status(201).json({
      message: "Job applied successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error in applyJob:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;

    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        populate: {
          path: "company",
        },
      });

    return res.status(200).json({
      applications,
      success: true,
    });
  } catch (error) {
    console.log("Error in getAppliedJobs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const getApplicants = async (req, res) => {
//   try {
//     const jobId = req.params.id;

//     const job = await Job.findById(jobId).populate({
//       path: "applications",
//       populate: {
//         path: "applicant",
//       },
//     });

//     if (!job) {
//       return res.status(404).json({
//         message: "Job not found",
//         success: false,
//       });
//     }

//     return res.status(200).json({
//       job,
//       success: true,
//     });
//   } catch (error) {
//     console.log("Error in getApplicants:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId).populate({
      path: "applications",
      populate: {
        path: "applicant",
        select: "fullname email phoneNumber", // prevent sending password
        populate: {
          path: "profile",
          select: "resume resumeOriginalName",
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    // TRANSFORM APPLICATIONS TO MATCH FRONTEND FORMAT
    // TRANSFORM APPLICATIONS TO MATCH FRONTEND
    const applicants = job.applications.map((app) => ({
      _id: app._id,
      fullname: app.applicant?.fullname || "",
      email: app.applicant?.email || "",
      phoneNumber: app.applicant?.phoneNumber || "",

      // FIX: resume comes from user.profile
      resume: app.applicant?.profile?.resume || "",
      resumeOriginalName:
        app.applicant?.profile?.resumeOriginalName || "Resume",

      appliedAt: app.createdAt,
    }));

    return res.status(200).json({
      success: true,
      applicants,
    });
  } catch (error) {
    console.log("Error in getApplicants:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      message: "Status updated successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error in updateStatus:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
