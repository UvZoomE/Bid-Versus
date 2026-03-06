const User = require("../models/User");
const Bid = require("../models/Bid");
const Job = require("../models/Job");
const { sendVerificationEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

// Helper function to generate a JWT token
const generateToken = (id) => {
  // Signs the user's ID with your secret key, expiring in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // 3. Create the user (Password hashing is handled automatically by our User.js model hook!)
    const user = await User.create({
      name,
      email,
      password,
    });

    // 4. Send back the user data AND their new token
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // === UPDATED: RESEND VERIFICATION EMAIL ===
    if (!user.isVerified) {
      const jwt = require("jsonwebtoken");

      // Generate a fresh token for this specific email
      const verificationToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        },
      );

      // Fire off the email utility
      await sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
        "guest", // Adjust this string if your email template expects something else
      );

      console.log(
        `[EMAIL] Resent verification email to ${user.email} from login screen.`,
      );

      return res.status(403).json({
        message:
          "Account must be verified. A new verification email has just been sent to your inbox. Please click the link to activate your account.",
      });
    }
    // ==========================================

    // 2. Now check the password
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. If everything is good, log them in!
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password, emailConfirm } = req.body; // Look for both possible inputs

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // === NEW: BRANCHED SECURITY CHECK ===
    if (user.isVerified) {
      // 1. Verified User: Require Password match
      if (!password) {
        return res
          .status(400)
          .json({
            message: "Password is required to delete a verified account.",
          });
      }
      if (!user.password) {
        return res
          .status(400)
          .json({ message: "Legacy test account. Please delete manually." });
      }

      const bcrypt = require("bcryptjs");
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Invalid password. Account deletion aborted." });
      }
    } else {
      // 2. Unverified Guest: Require Email match
      if (
        !emailConfirm ||
        emailConfirm.toLowerCase() !== user.email.toLowerCase()
      ) {
        return res
          .status(401)
          .json({ message: "Email does not match. Account deletion aborted." });
      }
    }
    // ====================================

    // === CASCADING DELETE: Wipe all associated data ===
    await Bid.deleteMany({ provider: user._id });
    await Job.deleteMany({ "contactInfo.email": user.email });

    const Notification = require("../models/Notifications");
    await Notification.deleteMany({
      $or: [{ sender: user._id }, { recipient: user._id }],
    });

    await Job.updateMany({}, { $pull: { jobComments: { author: user.name } } });
    await Bid.updateMany({}, { $pull: { comments: { author: user.name } } });

    // Delete the actual User account
    await user.deleteOne();

    res.json({
      message: "Account and all associated data permanently deleted.",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: "Server error during account deletion." });
  }
};

// @desc    Verify user email (and optionally set password for guests)
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token, password } = req.body; // <--- Now accepts password

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Mark as verified
    user.isVerified = true;

    // 2. If the user provided a password (Guest Flow), update it!
    if (password) {
      user.password = password; // Mongoose pre-save hook will hash this automatically
    }

    await user.save();

    res.status(200).json({
      success: true,
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = { registerUser, loginUser, verifyEmail, deleteAccount }; // Export it!
