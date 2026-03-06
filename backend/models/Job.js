const mongoose = require("mongoose");

// 1. Define the Comment Schema (Used for both Jobs and Bids)
const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// 3. Define the Main Job Schema (Customer's post)
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A job title is required"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Auto", "Home", "Other"], // Restricts inputs to only these three options
    },
    customCategory: {
      type: String,
    },
    description: {
      type: String,
    },
    originalQuote: {
      type: Number,
      required: [true, "Original quote amount is required"],
    },
    location: { type: String },
    zipCode: { type: String },

    author: {
      type: String,
      required: true,
    },
    // Note: Later, when we add user accounts, we will link this to the User model like this:
    // authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    contactInfo: {
      name: String,
      email: String,
      phone: String,
    },

    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Accepted", "Completed", "Cancelled"],
    },

    // When an offer is accepted, we will store that specific bid's ID here
    acceptedBidId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    documentUrl: { type: String },
    documentType: { type: String },

    // Embed the arrays we defined at the top of the file
    jobComments: [commentSchema],
    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
      },
    ],
  },
  {
    timestamps: true, // Automatically creates 'createdAt' and 'updatedAt' fields!
  },
);

// Export the model so our controllers can use it
module.exports = mongoose.model("Job", jobSchema);
