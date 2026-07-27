import mongoose, { Schema } from "mongoose";

const BorrowRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    isbn: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "borrowed",
        "returned",
        "overdue",
      ],
      default: "borrowed",
    },

    borrowDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    returnDate: Date,

    isReturned: {
      type: Boolean,
      default: false,
    },

    fine: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BorrowRequest ||
  mongoose.model(
    "BorrowRequest",
    BorrowRequestSchema
  );