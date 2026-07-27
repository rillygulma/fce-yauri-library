import mongoose, { Schema, Document, models } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  createdBy?: string;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "University Librarian",
    },
  },
  { timestamps: true }
);

export default models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);