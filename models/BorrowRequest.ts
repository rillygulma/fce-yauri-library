import mongoose, { Schema, Document } from "mongoose";

export interface IBorrowRequest extends Document {
  user: mongoose.Types.ObjectId;
  resource: mongoose.Types.ObjectId;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "returned";

  requestDate: Date;
  approvedDate?: Date;
  dueDate?: Date;
  returnDate?: Date;

  isReturned: boolean;
  fine: number;
}

const BorrowRequestSchema =
  new Schema<IBorrowRequest>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      resource: {
        type: Schema.Types.ObjectId,
        ref: "Resource",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
          "returned",
        ],
        default: "pending",
      },

      requestDate: {
        type: Date,
        default: Date.now,
      },

      approvedDate: {
        type: Date,
      },

      dueDate: {
        type: Date,
      },

      returnDate: {
        type: Date,
      },

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
  mongoose.model<IBorrowRequest>(
    "BorrowRequest",
    BorrowRequestSchema
  );