import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  description: string;
  content: string;
  date: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString(),
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Blog ||
  mongoose.model<IBlog>("Blog", BlogSchema);
