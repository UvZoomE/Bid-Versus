const Job = require("../models/Job");
const Bid = require("../models/Bid");
const User = require("../models/User"); // <-- ADD THIS
const jwt = require("jsonwebtoken"); // <-- ADD THIS
const Notification = require("../models/Notifications");
const {
  sendVerificationEmail,
  sendBidAcceptedEmail,
} = require("../utils/sendEmail");

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public / Private
const getJobs = async (req, res) => {
  try {
    // 1. Fetch jobs and populate bids
    const jobs = await Job.find().sort({ createdAt: -1 }).populate("bids");

    // 2. Identify the requester (if they passed a token)
    let requesterId = null;
    let requesterEmail = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        const jwt = require("jsonwebtoken");
        const User = require("../models/User");
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tokenUser = await User.findById(decoded.id);
        if (tokenUser) {
          requesterId = tokenUser._id.toString();
          requesterEmail = tokenUser.email.toLowerCase();
        }
      } catch (err) {
        // Just ignore, treat them as an anonymous guest
      }
    }

    // 3. CLEAN THE DATA BEFORE SENDING
    const safeJobs = jobs.map((job) => {
      const jobObj = job.toObject(); // Convert Mongoose document to plain JS object
      let canSeeContactInfo = false;

      if (requesterId) {
        // Rule A: Is the requester the CUSTOMER who created the job?
        if (
          jobObj.contactInfo &&
          jobObj.contactInfo.email.toLowerCase() === requesterEmail
        ) {
          canSeeContactInfo = true;
        }

        // Rule B: Is the requester the PROVIDER who won the bid?
        if (jobObj.status === "Accepted" && jobObj.acceptedBidId) {
          const winningBid = jobObj.bids.find(
            (b) => b._id.toString() === jobObj.acceptedBidId.toString(),
          );
          if (
            winningBid &&
            winningBid.provider &&
            winningBid.provider.toString() === requesterId
          ) {
            canSeeContactInfo = true;
          }
        }
      }

      // If neither rule passes, strip the sensitive data completely!
      if (!canSeeContactInfo) {
        delete jobObj.contactInfo;
      }

      return jobObj;
    });

    res.json(safeJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("bids");

    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Create a new job (Upload Quote)
// @route   POST /api/jobs
// @access  Public / Private
const createJob = async (req, res) => {
  try {
    // 1. SAFE DATA EXTRACTION
    // We check both 'contactEmail' (flat) and 'contactInfo[email]' (nested)
    // to ensure we capture the data regardless of how React sent it.
    const contactEmail =
      req.body.contactEmail || req.body["contactInfo[email]"];
    const contactName = req.body.contactName || req.body["contactInfo[name]"];
    const contactPhone =
      req.body.contactPhone || req.body["contactInfo[phone]"];

    const {
      title,
      category,
      customCategory,
      description,
      originalQuote,
      location,
      zipCode,
      author,
    } = req.body;

    console.log("------------------------------------------------");
    console.log(`[JOB ATTEMPT] New submission for: ${contactEmail}`);

    // 2. CHECK LOGIN STATUS
    let authorId = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const User = require("../models/User"); // Ensure User is imported at the top of the file
        const tokenUser = await User.findById(decoded.id);

        // === NEW: EMAIL MATCH SECURITY CHECK ===
        // Note: Make sure req.body.contactEmail is what your frontend sends for Quotes!
        const formEmail = req.body.contactEmail;

        if (
          tokenUser &&
          formEmail &&
          tokenUser.email.toLowerCase() === formEmail.toLowerCase()
        ) {
          authorId = decoded.id;
        } else {
          console.log(
            `[AUTH] ⚠️ Token email mismatch for Quote Creation. Treating as guest.`,
          );
        }
      } catch (error) {
        console.log(`[AUTH] Token invalid or expired. Treating as guest.`);
      }
    }

    const isLoggedIn = authorId !== null;

    let generatedToken = null;
    let newUser = null;

    // 3. GUEST LOGIC
    // Only run this if they are NOT logged in AND we have an email
    if (!isLoggedIn && contactEmail) {
      console.log(`[GUEST LOGIC] Analyzing email: ${contactEmail}`);
      const existingUser = await User.findOne({
        email: contactEmail.toLowerCase(),
      });

      if (existingUser) {
        console.log(
          `[GUEST LOGIC] ❌ Blocked. User exists (Verified: ${existingUser.isVerified})`,
        );

        // SCENARIO B: User exists but isn't signed in (or token failed)
        if (!existingUser.isVerified) {
          return res.status(400).json({
            message:
              "An account with this email exists but is not verified. Another verification email has been sent to you, check your inbox.",
          });
        } else {
          return res.status(400).json({
            message:
              "An account with this email already exists. Please sign in to submit your estimate.",
          });
        }
      } else {
        // SCENARIO A: Brand new guest! Create account.
        console.log(`[GUEST LOGIC] Creating NEW account for guest.`);
        const randomPassword =
          Math.random().toString(36).slice(-8) + "TopDogg1!";

        newUser = await User.create({
          name: contactName || author,
          email: contactEmail.toLowerCase(),
          password: randomPassword,
          phone: contactPhone,
          isVerified: false,
        });

        generatedToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });

        // === NEW: SEND EMAIL ===
        // In a real app, generate a specific verify token, but for now we send them to the site
        await sendVerificationEmail(
          newUser.email,
          newUser.name,
          generatedToken,
          "guest",
        );
        console.log(`[EMAIL] Sent verification email to ${newUser.email}`);
      }
    }

    // 4. CREATE THE JOB
    const job = await Job.create({
      title,
      category,
      customCategory,
      description,
      originalQuote,
      location,
      zipCode,
      author,
      contactInfo: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
      },
      documentUrl: req.file ? req.file.path : null,
      documentType: req.file ? req.file.mimetype : null,
      status: "Active",
      jobComments: [],
      bids: [],
    });

    console.log(`[SUCCESS] Job created: ${job._id}`);

    res.status(201).json({
      job,
      token: generatedToken,
      user: newUser
        ? { _id: newUser._id, name: newUser.name, email: newUser.email }
        : null,
    });
  } catch (error) {
    console.error("Job Creation Error:", error.message);
    res.status(400).json({ message: `Invalid data: ${error.message}` });
  }
};

// @desc    Accept a bid
// @route   PUT /api/jobs/:id/accept
// @access  Private
const acceptOffer = async (req, res) => {
  try {
    const { bidId } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Security Check: Ensure the person accepting is the job owner
    // (Note: we use loose equality != to handle MongoDB ObjectIds vs Strings)
    if (
      job.author !== req.user.name &&
      job.contactInfo?.email !== req.user.email
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to accept offers on this job" });
    }

    // --- THE FIX: Fetch the actual Bid document ---
    const winningBid = await Bid.findById(bidId);

    if (!winningBid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    job.status = "Accepted";
    job.acceptedBidId = bidId;
    await job.save();

    // === NOTIFICATION LOGIC ===
    // Now winningBid is the full object, so .provider definitely exists!
    if (winningBid.provider) {
      console.log(
        `[NOTIF] creating notification for Provider ID: ${winningBid.provider}`,
      );

      const providerUser = await User.findById(winningBid.provider);

      if (providerUser) {
        await Notification.create({
          recipient: winningBid.provider, // The Provider
          sender: req.user._id, // The Customer
          job: job._id,
          message: `Congratulations! Your bid of $${winningBid.amount} for "${job.title}" was accepted.`,
          read: false,
        });

        // 2. === NEW: SEND EMAIL ===
        await sendBidAcceptedEmail(
          providerUser.email,
          providerUser.name,
          job.title,
          winningBid.amount,
        );
        console.log(`[EMAIL] Sent acceptance email to ${providerUser.email}`);
      }
    } else {
      console.log("[NOTIF WARNING] Winning bid has no provider ID attached.");
    }

    res.json(job);
  } catch (error) {
    console.error("Accept Offer Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Unaccept/Undo an accepted bid
// @route   PUT /api/jobs/:id/unaccept
// @access  Private
const unacceptOffer = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = "Active";
    job.acceptedBidId = null;

    const updatedJob = await job.save();
    await updatedJob.populate("bids");

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Add a comment to the main job thread
// @route   POST /api/jobs/:id/comments
// @access  Public / Private
const addJobComment = async (req, res) => {
  try {
    const { author, text } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const newComment = {
      author,
      text,
      date: Date.now(),
    };

    job.jobComments.push(newComment);
    await job.save();

    await job.populate("bids");

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  acceptOffer,
  unacceptOffer,
  addJobComment,
};
