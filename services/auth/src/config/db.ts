import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "dropbite",
    });

    console.log("connected to mongodb");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
