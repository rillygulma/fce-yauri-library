"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

type FormData = {
  name: string;
  email: string;
  message: string;
};

const ContactPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 lg:px-24">
      <h1 className="mb-6 text-3xl font-bold text-blue-600 lg:text-5xl">
        Contact Us
      </h1>

      <div className="mb-4 text-lg text-gray-600">
        <p className="italic">Phone: (123) 456-7890</p>
        <p className="italic">Email: library@fceyauri.edu.ng</p>
      </div>

      <p className="mb-8 text-center text-lg text-gray-600">
        We would love to hear from you! Please fill out the form below for any
        enquiry.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md"
      >
        {/* Name */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Name
          </label>

          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="w-full rounded border px-3 py-2 text-gray-700 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Email
          </label>

          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="w-full rounded border px-3 py-2 text-gray-700 focus:outline-none"
          />
        </div>

        {/* Message */}
        <div className="mb-4">
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Message
          </label>

          <textarea
            id="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            required
            className="w-full rounded border px-3 py-2 text-gray-700 focus:outline-none"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`flex w-full items-center justify-center rounded px-4 py-3 font-bold text-white transition ${
            isLoading
              ? "cursor-not-allowed bg-blue-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default ContactPage;