import mongoose from "mongoose";
import env from "../util/validateEnvVars.js"

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_CONNECTION_STRING);
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB (", error, ")");
        process.exit(1);
    }
}

export default connectDB;
