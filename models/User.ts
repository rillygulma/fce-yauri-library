import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: [
        "student",
        "staff",
        "admin",
      ],
      default: "student",
    },

    gender: {
      type: String,
      enum: ["male", "female"],
    },

    admissionNo: {
      type: String,
      required: function () {
        return (
          this.role === "student"
        );
      },
    },

    staffNo: {
      type: String,
      required: function () {
        return (
          this.role === "staff" ||
          this.role === "librarian" ||
          this.role === "admin"
        );
      },
    },

    department: {
      type: String,
    },

    college: {
      type: String,
    },

    phoneNo: {
      type: String,
    },

    profilePicture: {
      type: String,
      default: "",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = models.User || model("User", UserSchema);

export default User;