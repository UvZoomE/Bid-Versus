const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Process.env accesses the variables inside your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // Exit the process with failure if it can't connect
    process.exit(1);
  }
};

module.exports = connectDB;
