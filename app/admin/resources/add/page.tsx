"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Save,
  X,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Newspaper,
  ClipboardList,
  GraduationCap,
  Check,
  Upload,
} from "lucide-react";

import Image from "next/image";

type ResourceType =
  | "book"
  | "journal"
  | "question-paper"
  | "project";

interface FormData {
  author: string;
  subject: string;
  title: string;
  callNumber: string;
  edition: string;
  publicationYear: string;
  publisher: string;
  isbn: string;
  totalCopies: string;
  volumeNumber: string;
  issn: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  session: string;
  college: string;
  department: string;
  graduationYear: string;
}

const initialFormData: FormData = {
  author: "",
  subject: "",
  title: "",
  callNumber: "",
  edition: "",
  publicationYear: "",
  publisher: "",
  isbn: "",
  totalCopies: "1",
  volumeNumber: "",
  issn: "",
  courseCode: "",
  courseTitle: "",
  semester: "",
  session: "",
  college: "",
  department: "",
  graduationYear: "",
};

export default function AddResourcePage() {
  const [
    resourceType,
    setResourceType,
  ] = useState<ResourceType>("book");

  const [
    formData,
    setFormData,
  ] =
    useState<FormData>(
      initialFormData
    );

  const [
    coverFile,
    setCoverFile,
  ] = useState<File | null>(
    null
  );

  const [
    coverPreview,
    setCoverPreview,
  ] = useState<
    string | null
  >(null);

  const [
    digitalFile,
    setDigitalFile,
  ] = useState<File | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    messageType,
    setMessageType,
  ] = useState<
    "success" | "error" | ""
  >("");

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(
          coverPreview
        );
      }
    };
  }, [coverPreview]);

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  function handleResourceTypeChange(
    type: ResourceType
  ) {
    setResourceType(type);

    setFormData(
      initialFormData
    );

    setCoverFile(null);

    setCoverPreview(null);

    setDigitalFile(null);

    setMessage("");

    setMessageType("");
  }

  function handleCoverChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "Please select a valid image file."
      );

      setMessageType("error");

      return;
    }

    setCoverFile(file);

    setCoverPreview(
      URL.createObjectURL(file)
    );
  }

  function removeCover() {
    setCoverFile(null);

    setCoverPreview(null);
  }

  function handleDigitalFileChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setDigitalFile(file);
  }

  async function uploadFile(
    file: File
  ) {
    const uploadData =
      new FormData();

    uploadData.append(
      "file",
      file
    );

    const response =
      await fetch(
        "/api/upload",
        {
          method: "POST",
          body: uploadData,
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "File upload failed."
      );
    }

    return data;
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      setMessage("");

      setMessageType("");

      let coverImage = "";

      if (
        resourceType === "book" ||
        resourceType === "journal"
      ) {
        if (!coverFile) {
          throw new Error(
            resourceType === "book"
              ? "Please upload the book cover."
              : "Please upload the journal cover image."
          );
        }

        const result =
          await uploadFile(
            coverFile
          );

        coverImage =
          result.url;
      }

      let digitalFileUrl = "";

      if (
        resourceType ===
          "question-paper" ||
        resourceType ===
          "project"
      ) {
        if (!digitalFile) {
          throw new Error(
            resourceType ===
              "question-paper"
              ? "Please upload the question paper file."
              : "Please upload the project file."
          );
        }

        const result =
          await uploadFile(
            digitalFile
          );

        digitalFileUrl =
          result.url;
      }

      let payload:
        Record<
          string,
          unknown
        > = {
        resourceType,
      };

      if (
        resourceType === "book"
      ) {
        payload = {
          resourceType:
            "book",

          title:
            formData.title,

          authors: [
            formData.author,
          ],

          subject:
            formData.subject,

          callNumber:
            formData.callNumber,

          edition:
            formData.edition,

          publicationYear:
            Number(
              formData.publicationYear
            ),

          publisher:
            formData.publisher,

          isbn:
            formData.isbn,

          totalCopies:
            Number(
              formData.totalCopies
            ),

          coverImage,
        };
      }

      if (
        resourceType ===
        "journal"
      ) {
        payload = {
          resourceType:
            "journal",

          title:
            formData.title,

          subject:
            formData.subject,

          volumeNumber:
            formData.volumeNumber,

          publicationYear:
            Number(
              formData.publicationYear
            ),

          issn:
            formData.issn,

          coverImage,
        };
      }

      if (
        resourceType ===
        "question-paper"
      ) {
        payload = {
          resourceType:
            "question-paper",

          courseCode:
            formData.courseCode,

          courseTitle:
            formData.courseTitle,

          semester:
            formData.semester,

          session:
            formData.session,

          college:
            formData.college,

          department:
            formData.department,

          digitalFile:
            digitalFileUrl,
        };
      }

      if (
        resourceType ===
        "project"
      ) {
        payload = {
          resourceType:
            "project",

          authors: [
            formData.author,
          ],

          title:
            formData.title,

          graduationYear:
            Number(
              formData.graduationYear
            ),

          college:
            formData.college,

          department:
            formData.department,

          digitalFile:
            digitalFileUrl,
        };
      }

      const response =
        await fetch(
          "/api/resources",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add resource."
        );
      }

      setMessage(
        data.message ||
          "Resource added successfully."
      );

      setMessageType(
        "success"
      );

      setFormData(
        initialFormData
      );

      setCoverFile(null);

      setCoverPreview(null);

      setDigitalFile(null);
    } catch (error) {
      console.error(
        "ADD RESOURCE ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setMessageType(
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  const resourceLabel =
    resourceType === "book"
      ? "Book"
      : resourceType ===
          "journal"
        ? "Journal"
        : resourceType ===
            "question-paper"
          ? "Question Paper"
          : "Project";

  return (
    <main className="min-h-screen bg-red-900 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 text-white">

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">

              <BookOpen
                size={25}
              />

            </div>

            <div>

              <p className="text-sm font-medium text-red-100">
                Library Management Software
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Add Library Resource
              </h1>

            </div>

          </div>

          <p className="max-w-2xl text-red-100">
            Add and organize books,
            journals, question papers,
            and academic projects in
            your library catalogue.
          </p>

        </div>


        {/* MAIN CARD */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">

          {/* TOP BAR */}

          <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Currently adding
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {resourceLabel}
                </h2>

              </div>

              <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-900">
                Admin Resource Management
              </div>

            </div>

          </div>


          <div className="p-6 sm:p-8 lg:p-10">

            {/* MESSAGE */}

            {message && (
              <div
                className={`mb-8 flex items-start gap-3 rounded-2xl border p-4 ${
                  messageType ===
                  "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >

                <div className="flex-1 text-sm font-medium">
                  {message}
                </div>

              </div>
            )}


            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-10"
            >

              {/* RESOURCE TYPE */}

              <section>

                <div className="mb-5">

                  <h2 className="text-lg font-bold text-gray-900">
                    Select Resource Type
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Choose the type of resource
                    you want to add to the
                    library catalogue.
                  </p>

                </div>


                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <ResourceTypeCard
                    type="book"
                    label="Book"
                    description="Physical library books"
                    icon={BookOpen}
                    active={
                      resourceType ===
                      "book"
                    }
                    onClick={() =>
                      handleResourceTypeChange(
                        "book"
                      )
                    }
                  />

                  <ResourceTypeCard
                    type="journal"
                    label="Journal"
                    description="Academic journals"
                    icon={Newspaper}
                    active={
                      resourceType ===
                      "journal"
                    }
                    onClick={() =>
                      handleResourceTypeChange(
                        "journal"
                      )
                    }
                  />

                  <ResourceTypeCard
                    type="question-paper"
                    label="Question Paper"
                    description="Past examination papers"
                    icon={ClipboardList}
                    active={
                      resourceType ===
                      "question-paper"
                    }
                    onClick={() =>
                      handleResourceTypeChange(
                        "question-paper"
                      )
                    }
                  />

                  <ResourceTypeCard
                    type="project"
                    label="Project"
                    description="Academic research projects"
                    icon={GraduationCap}
                    active={
                      resourceType ===
                      "project"
                    }
                    onClick={() =>
                      handleResourceTypeChange(
                        "project"
                      )
                    }
                  />

                </div>

              </section>


              {/* BOOK */}

              {resourceType ===
                "book" && (
                <>

                  <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 sm:p-8">

                    <SectionHeader
                      icon={BookOpen}
                      title="Book Information"
                      description="Enter the bibliographic details of the book."
                    />

                    <div className="grid gap-5 md:grid-cols-2">

                      <Input
                        label="Author"
                        name="author"
                        value={
                          formData.author
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Subject Area"
                        name="subject"
                        value={
                          formData.subject
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Title"
                        name="title"
                        value={
                          formData.title
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Call No."
                        name="callNumber"
                        value={
                          formData.callNumber
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Edition"
                        name="edition"
                        value={
                          formData.edition
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Date of Publication"
                        name="publicationYear"
                        type="number"
                        value={
                          formData.publicationYear
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Publisher"
                        name="publisher"
                        value={
                          formData.publisher
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="ISBN"
                        name="isbn"
                        value={
                          formData.isbn
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="No. of Copies"
                        name="totalCopies"
                        type="number"
                        value={
                          formData.totalCopies
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </section>


                  <CoverUpload
                    title="Upload Book Cover"
                    preview={
                      coverPreview
                    }
                    onChange={
                      handleCoverChange
                    }
                    onRemove={
                      removeCover
                    }
                  />

                </>
              )}


              {/* JOURNAL */}

              {resourceType ===
                "journal" && (
                <>

                  <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 sm:p-8">

                    <SectionHeader
                      icon={Newspaper}
                      title="Journal Information"
                      description="Enter the publication details of the journal."
                    />

                    <div className="grid gap-5 md:grid-cols-2">

                      <Input
                        label="Subject Area"
                        name="subject"
                        value={
                          formData.subject
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Title"
                        name="title"
                        value={
                          formData.title
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Volume No."
                        name="volumeNumber"
                        value={
                          formData.volumeNumber
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Date of Publication"
                        name="publicationYear"
                        type="number"
                        value={
                          formData.publicationYear
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="ISSN"
                        name="issn"
                        value={
                          formData.issn
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </section>


                  <CoverUpload
                    title="Upload Journal Cover Image"
                    preview={
                      coverPreview
                    }
                    onChange={
                      handleCoverChange
                    }
                    onRemove={
                      removeCover
                    }
                  />

                </>
              )}


              {/* QUESTION PAPER */}

              {resourceType ===
                "question-paper" && (
                <>

                  <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 sm:p-8">

                    <SectionHeader
                      icon={ClipboardList}
                      title="Question Paper Information"
                      description="Enter the academic information for this question paper."
                    />

                    <div className="grid gap-5 md:grid-cols-2">

                      <Input
                        label="Course Code"
                        name="courseCode"
                        value={
                          formData.courseCode
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Course Title"
                        name="courseTitle"
                        value={
                          formData.courseTitle
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <SelectInput
                        label="Semester"
                        name="semester"
                        value={
                          formData.semester
                        }
                        onChange={
                          handleChange
                        }
                        options={[
                          "First Semester",
                          "Second Semester",
                        ]}
                      />

                      <Input
                        label="Session"
                        name="session"
                        placeholder="e.g. 2025/2026"
                        value={
                          formData.session
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="College"
                        name="college"
                        value={
                          formData.college
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Department"
                        name="department"
                        value={
                          formData.department
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </section>


                  <FileUpload
                    title="Upload Question Paper"
                    file={
                      digitalFile
                    }
                    onChange={
                      handleDigitalFileChange
                    }
                  />

                </>
              )}


              {/* PROJECT */}

              {resourceType ===
                "project" && (
                <>

                  <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 sm:p-8">

                    <SectionHeader
                      icon={GraduationCap}
                      title="Project Information"
                      description="Enter the academic details of the project."
                    />

                    <div className="grid gap-5 md:grid-cols-2">

                      <Input
                        label="Author"
                        name="author"
                        value={
                          formData.author
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Title"
                        name="title"
                        value={
                          formData.title
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Graduation Year"
                        name="graduationYear"
                        type="number"
                        value={
                          formData.graduationYear
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="College"
                        name="college"
                        value={
                          formData.college
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <Input
                        label="Department"
                        name="department"
                        value={
                          formData.department
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </section>


                  <FileUpload
                    title="Upload Project File"
                    file={
                      digitalFile
                    }
                    onChange={
                      handleDigitalFileChange
                    }
                  />

                </>
              )}


              {/* SUBMIT */}

              <div className="border-t border-gray-200 pt-8">

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-900 px-6 py-4 text-base font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-950 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <Save
                    size={20}
                  />

                  {loading
                    ? "Adding Resource..."
                    : `Add ${resourceLabel}`}

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}


/* RESOURCE TYPE CARD */

interface ResourceTypeCardProps {
  type: ResourceType;
  label: string;
  description: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}

function ResourceTypeCard({
  label,
  description,
  icon: Icon,
  active,
  onClick,
}: ResourceTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
        active
          ? "border-red-900 bg-red-50 shadow-md"
          : "border-gray-200 bg-white hover:border-red-300 hover:shadow-sm"
      }`}
    >

      {active && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-900 text-white">
          <Check
            size={14}
          />
        </div>
      )}

      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
          active
            ? "bg-red-900 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        <Icon
          size={22}
        />
      </div>

      <h3 className="font-bold text-gray-900">
        {label}
      </h3>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>

    </button>
  );
}


/* SECTION HEADER */

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-7 flex items-start gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-900">
        <Icon
          size={22}
        />
      </div>

      <div>

        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>

      </div>

    </div>
  );
}


/* INPUT */

interface InputProps {
  label: string;
  name: string;
  value: string;
  type?: string;
  placeholder?: string;
  required?: boolean;

  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
}

function Input({
  label,
  name,
  value,
  type = "text",
  placeholder,
  required = false,
  onChange,
}: InputProps) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        name={name}
        value={value}
        placeholder={
          placeholder ||
          `Enter ${label.toLowerCase()}`
        }
        required={required}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-red-900 focus:ring-4 focus:ring-red-900/10"
      />

    </div>
  );
}


/* SELECT */

interface SelectInputProps {
  label: string;
  name: string;
  value: string;

  options: string[];

  onChange: (
    e: ChangeEvent<HTMLSelectElement>
  ) => void;
}

function SelectInput({
  label,
  name,
  value,
  options,
  onChange,
}: SelectInputProps) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}

        <span className="ml-1 text-red-600">
          *
        </span>
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-900 focus:ring-4 focus:ring-red-900/10"
      >

        <option value="">
          Select {label}
        </option>

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}

      </select>

    </div>
  );
}


/* COVER UPLOAD */

interface CoverUploadProps {
  title: string;

  preview: string | null;

  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;

  onRemove: () => void;
}

function CoverUpload({
  title,
  preview,
  onChange,
  onRemove,
}: CoverUploadProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Upload a clear image for the
          resource cover.
        </p>

      </div>

      {preview ? (

        <div className="relative w-fit">

          <Image
            src={preview}
            alt="Cover preview"
            className="h-72 w-52 rounded-2xl object-cover shadow-lg"
            width={208}
            height={288}
          />

          <button
            type="button"
            onClick={
              onRemove
            }
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-900 text-white shadow-lg transition hover:bg-red-950"
          >
            <X
              size={17}
            />
          </button>

        </div>

      ) : (

        <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition hover:border-red-900 hover:bg-red-50">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm transition group-hover:text-red-900">

            <ImageIcon
              size={32}
            />

          </div>

          <span className="mt-5 font-bold text-gray-800">
            Click to upload cover
          </span>

          <span className="mt-2 text-sm text-gray-500">
            PNG, JPG, or JPEG
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={
              onChange
            }
            className="hidden"
          />

        </label>

      )}

    </section>
  );
}


/* DIGITAL FILE UPLOAD */

interface FileUploadProps {
  title: string;

  file: File | null;

  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
}

function FileUpload({
  title,
  file,
  onChange,
}: FileUploadProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Upload the digital document
          associated with this resource.
        </p>

      </div>


      <label className="group flex cursor-pointer items-center gap-5 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition hover:border-red-900 hover:bg-red-50">

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm group-hover:text-red-900">

          {file ? (
            <FileText
              size={28}
            />
          ) : (
            <Upload
              size={28}
            />
          )}

        </div>

        <div className="min-w-0">

          <p className="font-bold text-gray-800">
            {file
              ? file.name
              : title}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {file
              ? "File selected successfully"
              : "Choose a PDF or document file"}
          </p>

        </div>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={
            onChange
          }
          className="hidden"
        />

      </label>

    </section>
  );
}