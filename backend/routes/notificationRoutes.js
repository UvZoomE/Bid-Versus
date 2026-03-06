const express = require("express");
const router = express.Router();
const Notification = require("../models/Notifications");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    // Find notifications for THIS user, sort by newest first
    const notifications = await Notification.find({
      recipient: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/notifications/read
// @desc    Mark all as read
// @access  Private
router.put("/read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } },
    );
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
