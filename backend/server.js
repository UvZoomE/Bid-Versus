require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const path = require("path"); // <-- No longer needed!
const connectDB = require("./config/db");
const notificationRoutes = require("./routes/notificationRoutes.js");

// Import the Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const bidRoutes = require("./routes/bidRoutes");

// Initialize Express
const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// === PRODUCTION CORS SECURITY ===
// This acts as a bouncer, only letting your specific domains talk to the database
app.use(
  cors({
    origin: [
      "https://bidversus.com",
      "https://www.bidversus.com",
      "http://localhost:5173", // Keep this so you can still build features on your own machine!
    ],
    credentials: true,
  }),
);
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// MOUNT ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/notifications", notificationRoutes);

// ==========================================
// BOOT UP THE SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
});
