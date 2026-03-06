const mongoose = require("mongoose");

// We can keep comments embedded here, since they belong directly to this specific bid
const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const bidSchema = new mongoose.Schema(
  {
    // 1. Relational Links (Connecting the Bid to the Job and the Provider)
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Job", // Tells Mongoose this ID belongs to the Job collection
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tells Mongoose this ID belongs to the User collection
    },

    // 2. Provider Snapshot Details (In case the User profile changes, the bid retains the info at the time it was made)
    providerName: { type: String, required: true },
    providerContact: {
      phone: String,
      email: String,
      location: String,
    },

    // 3. The Actual Offer Details
    amount: {
      type: Number,
      required: [true, "Bid amount is required"],
    },
    counterAmount: {
      type: Number,
    },
    notes: {
      type: String,
    },
    location: { type: String },
    zipCode: { type: String },

    // 4. Trust & Verification
    rating: {
      type: Number,
      default: 5.0,
    },
    signedDocumentAttached: {
      type: Boolean,
      default: false,
    },
    verifiedByTopDogg: {
      type: Boolean,
      default: false,
    },

    // 5. Document Storage
    documentUrl: { type: String },
    documentType: { type: String },

    // 6. Community Discussion
    comments: [commentSchema],
    customerOffer: {
    type: Number,
    default: null,
  },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Bid", bidSchema);
