import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/strict-registration";

const deleteAllCollections = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await mongoose.connection.dropDatabase();
    console.log("💣 Entire database deleted (all collections removed)!");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

deleteAllCollections();
