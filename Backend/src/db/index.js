import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );
    console.log(
      `Mongoo DB Connected Succesfully : ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.error(`There is Some Error While Connecting DB: ${error}`);
  }
};
