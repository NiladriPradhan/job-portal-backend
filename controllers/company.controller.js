import Company from "../model/companyModel.js";
import cloudinary from "../utils/cloudinary.js";

// export const registerCompany = async (req, res) => {
//     try {
//         const { name, description, website } = req.body;

//         if (!name || !description) {
//             return res.status(400).json({ message: "Name & description required" });
//         }

//         let company = await Company.findOne({ name });
//         if (company) {
//             return res.status(400).json({
//                 message: "This company already exists",
//                 success: false
//             });
//         }

//         company = await Company.create({
//             name,
//             description,
//             website: website || "",
//             companyId: req.id,   // <- correct field
//         });

//         return res.status(201).json({
//             message: "Company created successfully",
//             company,
//             success: true
//         });

//     } catch (error) {
//         console.log("Error in register company", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };

export const registerCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Name & description required",
        success: false,
      });
    }

    let existing = await Company.findOne({ name });
    if (existing) {
      return res.status(400).json({
        message: "This company already exists",
        success: false,
      });
    }

    let logoUrl = null;

    // 🔥 If logo exists, upload to Cloudinary
    if (req.file) {
      const cloudUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "company_logos" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(req.file.buffer);
      });

      logoUrl = cloudUpload.secure_url;
    }

    const company = await Company.create({
      name,
      description,
      website,
      location,
      logo: logoUrl, // now contains cloudinary url
      companyId: req.id,
    });

    return res.status(201).json({
      message: "Company created successfully",
      company,
      success: true,
    });
  } catch (error) {
    console.log("Error in register company", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.find();
    if (!companies) {
      return res
        .status(404)
        .json({ message: "No companies found", success: false });
    }
    return res.status(200).json({ companies, success: true });
  } catch (error) {
    console.log("Error in get company", error);
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({
        message: "Company does not exist!",
        success: false,
      });
    }
    res.status(200).json({
      company,
      message: "Company found successfully",
      success: true,
    });
  } catch (error) {
    console.log(" Error in getcComanyById", error);
  }
};

// export const updateCompanyById = async (req, res) => {
//   try {
//     const { name, description, website, logo } = req.body;
//     const file = req.file;
//     // cloudinary

//     const updateData = {
//       name,
//       description,
//       website,
//       logo,
//     };

//     const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//     });
//     return res.status(200).json({
//       message: "Company updated successfully",
//       company,
//       success: true,
//     });
//   } catch (error) {
//     console.log("error in company data updated", error);
//   }
// };

export const updateCompanyById = async (req, res) => {
  try {
    const { name, description, website,location } = req.body;
    const file = req.file; // file uploaded via multer

    const updateData = {
      name,
      description,
      website,
      location
    };

    // If user uploaded a new file → upload to cloudinary
    if (file) {
      const cloudinaryUpload = cloudinary.uploader.upload_stream(
        { folder: "company_logos" },
        (err, result) => {
          if (err) throw err;
          updateData.logo = result.secure_url;
        }
      );

      cloudinaryUpload.end(file.buffer);
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updated,
    });
  } catch (err) {
    console.log("error in company data updated", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
