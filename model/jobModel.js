import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String,
    }],  //["React", "Node.js", "3+ years experience"]
    salary: {
        type: Number,
        required: true
    },
    experiencelevel: {
        type: Number,
        required: true
    },
    location: {
        type: String
    },
    jobType: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application'
        }
    ]
},{
    timestamps: true
});

const Job = mongoose.model("Job", jobSchema);
export default Job;