import mongoose, { Schema, models, model } from "mongoose";

export interface IContact {
  name: string;
  email: string;
  message: string;
  createdAt?: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact =
  models.Contact || model<IContact>("Contact", contactSchema);

export default Contact;