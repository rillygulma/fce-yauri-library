import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export type ResourceType =
  | "book"
  | "journal"
  | "question-paper"
  | "project";

export interface IResource
  extends Document {
  resourceType: ResourceType;

  title?: string;
  authors?: string[];
  subject?: string;
  callNumber?: string;
  edition?: string;
  publicationYear?: number;
  publisher?: string;
  isbn?: string;

  totalCopies?: number;
  availableCopies?: number;
  borrowedCopies?: number;

  volumeNumber?: string;
  issn?: string;

  courseCode?: string;
  courseTitle?: string;
  semester?: string;
  session?: string;

  college?: string;
  department?: string;
  graduationYear?: number;

  coverImage?: string;
  digitalFile?: string;

  status:
    | "available"
    | "unavailable";

  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema =
  new Schema<IResource>(
    {
      resourceType: {
        type: String,
        enum: [
          "book",
          "journal",
          "question-paper",
          "project",
        ],
        required: true,
        index: true,
      },

      title: {
        type: String,
        trim: true,
        index: true,
      },

      authors: {
        type: [String],
        default: [],
        index: true,
      },

      subject: {
        type: String,
        trim: true,
        index: true,
      },

      callNumber: {
        type: String,
        trim: true,
        index: true,
      },

      edition: {
        type: String,
        trim: true,
      },

      publicationYear: {
        type: Number,
      },

      publisher: {
        type: String,
        trim: true,
        index: true,
      },

      isbn: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        index: true,
      },

      totalCopies: {
        type: Number,
        default: 1,
        min: 1,
      },

      availableCopies: {
        type: Number,
        default: 1,
        min: 0,
        index: true,
      },

      borrowedCopies: {
        type: Number,
        default: 0,
        min: 0,
      },

      volumeNumber: {
        type: String,
        trim: true,
      },

      issn: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        index: true,
      },

      courseCode: {
        type: String,
        trim: true,
        index: true,
      },

      courseTitle: {
        type: String,
        trim: true,
        index: true,
      },

      semester: {
        type: String,
        trim: true,
      },

      session: {
        type: String,
        trim: true,
        index: true,
      },

      college: {
        type: String,
        trim: true,
        index: true,
      },

      department: {
        type: String,
        trim: true,
        index: true,
      },

      graduationYear: {
        type: Number,
      },

      coverImage: {
        type: String,
        trim: true,
      },

      digitalFile: {
        type: String,
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "available",
          "unavailable",
        ],
        default: "available",
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

const Resource: Model<IResource> =
  mongoose.models.Resource ||
  mongoose.model<IResource>(
    "Resource",
    ResourceSchema
  );

export default Resource;