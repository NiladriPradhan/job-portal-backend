import mongoose from "mongoose";

export const ConnectDB = async ()=>{
    try {
        console.log("MONGO_URL:", process.env.MONGODB_URL);

        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected");
    } catch (error) {
        console.log("falied to connect DB!",error.message);
        
    }
}