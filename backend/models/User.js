const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true, // Prevents two users from signing up with the same email
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false, // Security feature: This ensures the password is NOT returned when we query users
    },

    // Optional fields that get populated if they use the Provider forms
    businessName: { type: String },
    phone: { type: String },
    location: { type: String },

    // This helps us track the auto-created guest accounts from your frontend logic
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// Mongoose Hooks & Methods
// ==========================================

// 1. Hash the password BEFORE saving the user to the database
userSchema.pre("save", async function (next) {
  // If the password isn't being modified (e.g., they are just updating their phone number), skip this
  if (!this.isModified("password")) {
    next();
  }

  // Generate a 'salt' (a random string to make the hash totally unique)
  const salt = await bcrypt.genSalt(10);
  // Replace the plain text password with the hashed version
  this.password = await bcrypt.hash(this.password, salt);
});

// 2. Create a custom method to check if a login attempt matches the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
