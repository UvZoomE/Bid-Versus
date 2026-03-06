const express = require("express");
const router = express.Router();

// Import the controller functions
const {
  getJobs,
  getJobById,
  createJob,
  acceptOffer,
  unacceptOffer,
  addJobComment,
} = require("../controllers/jobController");

// Import our security and file-handling bouncers
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ==========================================
// CORE JOB ROUTES (/api/jobs)
// ==========================================

router
  .route("/")
  // @route   GET /api/jobs
  // @desc    Fetch all jobs for the dashboard feeds
  // @access  Public
  .get(getJobs)

  // @route   POST /api/jobs
  // @desc    Create a new job request and upload the original quote document
  // @access  Public / Private (Open to guests based on your frontend logic)
  // Intercepts the file upload before hitting the controller
  .post(upload.single("document"), createJob);

router
  .route("/:id")
  // @route   GET /api/jobs/:id
  // @desc    Fetch a single job by its ID
  // @access  Public
  .get(getJobById);

// ==========================================
// JOB ACTION ROUTES
// ==========================================

// @route   PUT /api/jobs/:id/accept
// @desc    Accept a specific bid on a job
// @access  Private (Requires user to be logged in)
router.put("/:id/accept", protect, acceptOffer);

// @route   PUT /api/jobs/:id/unaccept
// @desc    Undo an accepted bid, returning the job to 'Active' status
// @access  Private
router.put("/:id/unaccept", protect, unacceptOffer);

// @route   POST /api/jobs/:id/comments
// @desc    Add a general comment to the main job thread
// @access  Public / Private
router.post("/:id/comments", addJobComment);

module.exports = router;
