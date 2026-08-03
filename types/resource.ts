export type ResourceType =
  | "book"
  | "journal"
  | "question-paper"
  | "project"
  | "ebook";

export interface Resource {
  _id: string;

  title: string;

  subtitle?: string;

  authors: string[];

  resourceType: ResourceType;

  isbn?: string;

  issn?: string;

  courseCode?: string;

  courseTitle?: string;

  semester?: string;

  level?: string;

  session?: string;

  publisher: string;

  publicationYear: number;

  edition?: string;

  language?: string;

  subject: string;

  keywords: string[];

  classificationNumber?: string;

  callNumber?: string;

  accessionNumber: string;

  shelfLocation?: string;

  college?: string;

  department?: string;

  totalCopies: number;

  availableCopies: number;

  borrowedCopies: number;

  coverImage?: string;

  digitalFile?: string;

  description?: string;

  status:
    | "available"
    | "unavailable";

  createdAt?: string;

  updatedAt?: string;
}

export interface OPACResponse {
  success: boolean;

  resources: Resource[];

  total: number;

  page: number;

  limit: number;

  pages: number;
}