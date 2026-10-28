
import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

const EResourceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["ebook", "journal"],
      required: true,
      index: true,
    },
    author: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
      index: true,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    publicationYear: {
      type: Number,
      min: 1000,
      max: 2100,
    },
    isbn: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    volume: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    issue: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    keywords: {
      type: [String],
      default: [],
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

EResourceSchema.index({
  title: "text",
  author: "text",
  subject: "text",
  description: "text",
  keywords: "text",
});

export type EResourceDocument =
  InferSchemaType<typeof EResourceSchema>;

const EResource: Model<EResourceDocument> =
  (mongoose.models.EResource as
    | Model<EResourceDocument>
    | undefined) ??
  mongoose.model<EResourceDocument>(
    "EResource",
    EResourceSchema,
  );

export default EResource;
