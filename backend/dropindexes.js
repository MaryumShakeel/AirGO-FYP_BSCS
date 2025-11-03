import mongoose from "mongoose";

const MONGO_URI = "mongodb://127.0.0.1:27017/strict-registration";

const dropIndexes = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await mongoose.connection.collection("users").dropIndexes();
    console.log("✅ All indexes dropped successfully from 'users' collection!");
  } catch (err) {
    console.error("Error dropping indexes:", err);
  } finally {
    await mongoose.disconnect();
  }
};

dropIndexes();
