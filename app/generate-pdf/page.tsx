"use client";

import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generatePdf = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setPdfUrl(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      setPdfUrl(url); // 👈 store for preview instead of auto download
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${topic}.pdf`;
    a.click();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">

      {/* FORM */}
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-3xl font-bold">
          AI PDF Generator
        </h1>

        <input
          type="text"
          placeholder="Enter a topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <button
          onClick={generatePdf}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </div>

      {/* PREVIEW SECTION */}
      {pdfUrl && (
        <div className="w-full max-w-4xl space-y-4">
          <h2 className="text-xl font-semibold">
            Preview
          </h2>

          <iframe
            src={pdfUrl}
            className="w-full h-[600px] border rounded-lg"
          />

          <button
            onClick={downloadPdf}
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Download PDF
          </button>
        </div>
      )}
    </main>
  );
}