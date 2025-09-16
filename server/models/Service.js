const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Add service features as an array
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    // Add requirements/prerequisites
    requirements: {
      type: String,
      trim: true,
      default: "",
    },
    // Add delivery time in days
    deliveryTime: {
      type: Number,
      default: 7,
      min: 1,
    },
    // Add revisions allowed
    revisions: {
      type: Number,
      default: 3,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "rejected"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    statusHistory: [
      {
        status: String,
        date: Date,
        reason: String,
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ title: "text", description: "text" });

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
