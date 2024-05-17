import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`\n MONGODB connected !! DB HOST ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILD", error);
        process.exit(1);
    }
};

export default connectDB;