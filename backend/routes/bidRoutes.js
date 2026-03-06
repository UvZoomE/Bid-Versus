const express = require("express");
const router = express.Router();

const {
  createBid,
  updateBid,
  deleteBid,
  sendCustomerCounter,
  respondToCounter,
  addBidComment
} = require("../controllers/bidController");

// Import our security and file-handling bouncers
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// @route   POST /api/bids
// @desc    Submit a new bid on a job
// @access  Private
// Notice how the request passes through 'protect', then 'upload', and FINALLY hits 'createBid'
router.post("/", upload.single("document"), createBid);

// @route   PUT /api/bids/:id
// @desc    Update/Edit an existing bid (or submit a counter-offer)
// @access  Private
router.put("/:id", protect, upload.single("document"), updateBid);

// @route   DELETE /api/bids/:id
// @desc    Rescind/Delete a bid
// @access  Private
router.delete("/:id", protect, deleteBid);

// === ADD THESE LINES IF MISSING ===
router.put("/:id/counter", protect, sendCustomerCounter);
router.put("/:id/respond-counter", protect, respondToCounter);
router.post("/:id/comments", addBidComment);

module.exports = router;
