"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Message = {
  role: "user" | "bot";
  text: string;
};

export default function LibraryChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botMessage: Message = {
        role: "bot",
        text: data.reply || "No response from Gemini.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Error connecting to Gemini API.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/images/fce-logo.jpeg"
            alt="FCE Logo"
            width={42}
            height={42}
            className="rounded-lg object-cover"
          />

          <div>
            <h1 className="text-lg md:text-xl font-bold text-blue-600">
              📚 FCE Yauri Library AI Assistant
            </h1>
            <p className="text-xs text-gray-500">
              Powered by E-library FCE Yauri
            </p>
          </div>
        </div>

        <span className="text-xs md:text-sm text-gray-500 hidden md:block">
          Ask your questions — AI is here to help!
        </span>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-lg">👋 Welcome to FCE Yauri Library AI</p>
            <p className="text-sm">
              Ask about any course, research, or academic resources!
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] md:max-w-[60%] px-4 py-3 rounded-2xl text-sm md:text-base shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 border rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border px-4 py-3 rounded-2xl text-gray-500 text-sm animate-pulse">
              FCE Yauri Library AI is thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* INPUT */}
      <footer className="p-3 md:p-4 bg-white border-t flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about anything..."
          className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50"
        >
          Send
        </button>
      </footer>
    </div>
  );
}