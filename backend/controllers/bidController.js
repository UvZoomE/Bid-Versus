const Bid = require("../models/Bid");
const Job = require("../models/Job");
const User = require("../models/User"); // Import User model
const jwt = require("jsonwebtoken"); // Import JWT
const { sendVerificationEmail } = require("../utils/sendEmail");
const Notification = require("../models/Notifications"); // Ensure this is imported

// @desc    Customer sends a counter offer to a provider
// @route   PUT /api/bids/:id/counter
const sendCustomerCounter = async (req, res) => {
  try {
    const { amount } = req.body;
    const bid = await Bid.findById(req.params.id).populate("job");

    if (!bid) return res.status(404).json({ message: "Bid not found" });

    // Update the bid with the customer's offer
    bid.customerOffer = amount;
    await bid.save();

    // Notify the Provider
    await Notification.create({
      recipient: bid.provider,
      sender: req.user._id,
      job: bid.job._id,
      message: `New Counter Offer: The customer offered $${amount} for "${bid.job.title}".`,
      read: false,
    });

    res.json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Provider responds to customer counter
// @route   PUT /api/bids/:id/respond-counter
const respondToCounter = async (req, res) => {
  try {
    const { action, newAmount } = req.body; // action: 'accept' or 'decline'

    // Debug Log
    console.log(`[COUNTER] Processing: ${action} for Bid ${req.params.id}`);

    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    const job = await Job.findById(bid.job);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (action === "accept") {
      // === CRITICAL SAFETY CHECK ===
      // If the customerOffer is missing, DO NOT crash. Return an error.
      if (!bid.customerOffer) {
        console.error("[COUNTER ERROR] Tried to accept an empty offer.");
        return res.status(400).json({
          message: "Cannot accept: No counter-offer found in database.",
        });
      }

      console.log(`[COUNTER] Accepting offer: $${bid.customerOffer}`);

      // 1. Update Price
      bid.amount = bid.customerOffer;
      bid.customerOffer = null; // Clear the pending offer
      await bid.save();

      // 2. Update Job
      job.status = "Accepted";
      job.acceptedBidId = bid._id;
      await job.save();

      // 3. Notify Customer
      if (job.contactInfo && job.contactInfo.email) {
        const User = require("../models/User");
        const customerUser = await User.findOne({
          email: job.contactInfo.email,
        });
        if (customerUser) {
          await Notification.create({
            recipient: customerUser._id,
            sender: req.user._id,
            job: job._id,
            message: `Offer Accepted! ${bid.providerName} accepted your price of $${bid.amount}.`,
            read: false,
          });
        }
      }
    } else if (action === "decline") {
      // === DECLINE LOGIC ===
      console.log(`[COUNTER] Declining offer.`);

      // 1. Clear the customer offer (This removes the blue box)
      bid.customerOffer = null;

      // 2. Optional: If provider typed a new number, update the price
      if (newAmount) {
        bid.amount = Number(newAmount);
      }

      // 3. FORCE SAVE
      await bid.save();
    }

    res.json({ bid, job });
  } catch (error) {
    console.error("Respond Counter Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Submit a new bid on a job
// @route   POST /api/bids
// @access  Private (or Guest with auto-creation)
const createBid = async (req, res) => {
  try {
    // 1. DATA EXTRACTION
    const {
      jobId,
      amount,
      notes,
      location,
      zipCode,
      providerName,
      contactPhone,
      contactEmail,
      contactLocation,
      verifiedByTopDogg,
    } = req.body;

    console.log("------------------------------------------------");
    console.log(
      `[BID ATTEMPT] New bid for Job ${jobId} from ${contactEmail || "Unknown"}`,
    );

    // 2. CHECK LOGIN STATUS (MANUAL CHECK)
    let providerId = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // === NEW: EMAIL MATCH SECURITY CHECK ===
        const tokenUser = await User.findById(decoded.id);

        // Check if the user attached to the token matches the email typed in the form
        if (
          tokenUser &&
          tokenUser.email.toLowerCase() === contactEmail.toLowerCase()
        ) {
          providerId = decoded.id;
          console.log(
            `[AUTH] ✅ Token verified & email matches. Provider ID: ${providerId}`,
          );
        } else {
          console.log(
            `[AUTH] ⚠️ Token email mismatch! Token owner: ${tokenUser?.email}, Form email: ${contactEmail}. Treating as guest.`,
          );
          // providerId remains null, triggering the Guest Auto-Creation logic below!
        }
      } catch (error) {
        console.log(`[AUTH] Token invalid or expired. Treating as guest.`);
      }
    }

    let generatedToken = null;
    let newUser = null;

    // 3. GUEST LOGIC
    // Only run this if we didn't find a valid token above
    if (!providerId && contactEmail) {
      console.log(`[GUEST BID] Checking email: ${contactEmail}`);
      const existingUser = await User.findOne({
        email: contactEmail.toLowerCase(),
      });

      if (existingUser) {
        console.log(`[GUEST BID] ❌ User exists. Block and ask to sign in.`);
        if (!existingUser.isVerified) {
          return res.status(400).json({
            message:
              "An account with this email exists but is not verified. Check your inbox for the verification link.",
          });
        } else {
          return res.status(400).json({
            message:
              "An account with this email already exists. Please sign in to place your bid.",
          });
        }
      } else {
        // CREATE NEW PROVIDER ACCOUNT
        console.log(`[GUEST BID] Creating NEW provider account...`);
        const randomPassword =
          Math.random().toString(36).slice(-8) + "TopDogg1!";

        newUser = await User.create({
          name: providerName,
          email: contactEmail.toLowerCase(),
          password: randomPassword,
          phone: contactPhone,
          isVerified: false,
        });

        // Generate Token
        generatedToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });

        // Send Email
        await sendVerificationEmail(
          newUser.email,
          newUser.name,
          generatedToken,
          "guest",
        );
        console.log(`[EMAIL] Sent verification email to ${newUser.email}`);

        providerId = newUser._id;
        console.log(`[GUEST BID] Account created. ID: ${providerId}`);
      }
    }

    // 4. VALIDATE JOB
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // === NEW: PREVENT SELF-BIDDING ===
    // Check if the provider's email matches the job author's email
    // OR if the provider's User ID matches the author's User ID (if both are logged in)
    const isSelfBid =
      (contactEmail &&
        job.contactInfo &&
        contactEmail.toLowerCase() === job.contactInfo.email.toLowerCase()) ||
      (providerId && req.user && req.user.email === job.contactInfo?.email);

    if (isSelfBid) {
      return res
        .status(400)
        .json({ message: "You cannot place a bid on your own job request." });
    }
    // =================================

    // 5. CREATE THE BID
    const bid = await Bid.create({
      job: jobId,
      provider: providerId,
      providerName,
      providerContact: {
        phone: contactPhone,
        email: contactEmail,
        location: contactLocation,
      },
      amount,
      notes,
      location,
      zipCode,
      documentUrl: req.file ? req.file.path : null,
      documentType: req.file ? req.file.mimetype : null,
      verifiedByTopDogg,
    });

    // Link bid to job
    job.bids.push(bid._id);
    await job.save();

    console.log(`[SUCCESS] Bid placed: ${bid._id}`);

    // 6. RESPONSE
    res.status(201).json({
      bid,
      token: generatedToken,
      user: newUser
        ? { _id: newUser._id, name: newUser.name, email: newUser.email }
        : null,
    });
  } catch (error) {
    console.error("Bid Creation Error:", error.message);
    res.status(400).json({ message: `Invalid bid data: ${error.message}` });
  }
};

// @desc    Add a comment to a specific bid
// @route   POST /api/bids/:id/comments
// @access  Public / Private
const addBidComment = async (req, res) => {
  try {
    const { author, text } = req.body;
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const newComment = {
      author,
      text,
      date: Date.now(),
    };

    bid.comments.push(newComment);
    await bid.save();

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Update a bid
// @route   PUT /api/bids/:id
// @access  Private
const updateBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Ensure the user owns this bid
    if (bid.provider.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this bid" });
    }

    // Update fields
    bid.amount = req.body.amount || bid.amount;
    bid.notes = req.body.notes || bid.notes;
    bid.location = req.body.location || bid.location;
    bid.zipCode = req.body.zipCode || bid.zipCode; // Ensure zip updates too

    // Update file if a new one was uploaded
    if (req.file) {
      bid.documentUrl = req.file.path;
      bid.documentType = req.file.mimetype;
      bid.verifiedByTopDogg = req.body.verifiedByTopDogg === "true";
    }

    const updatedBid = await bid.save();
    res.json(updatedBid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a bid
// @route   DELETE /api/bids/:id
// @access  Private
const deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (bid.provider.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Remove bid ID from the Job's array
    await Job.updateOne({ _id: bid.job }, { $pull: { bids: bid._id } });

    await bid.deleteOne();
    res.json({ message: "Bid removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBid,
  updateBid,
  deleteBid,
  sendCustomerCounter,
  respondToCounter,
  addBidComment,
};
