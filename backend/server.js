require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db"); // Uses your database connection file
const notificationRoutes = require("./routes/notificationRoutes.js");

// Import the Routes we built earlier
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const bidRoutes = require("./routes/bidRoutes");

// Initialize Express
const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors()); // Allows your React app to talk to this server
app.use(express.json()); // Allows the server to accept JSON data
app.use(express.urlencoded({ extended: true })); // Allows the server to accept form data

// VERY IMPORTANT: This makes your "uploads" folder publicly accessible
// so your React Modals.jsx can display the PDF/Images you upload!
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// MOUNT ROUTES
// ==========================================
// This tells Express: "If a request starts with /api/jobs, send it to jobRoutes.js"
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/notifications", notificationRoutes);

// ==========================================
// BOOT UP THE SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
});
