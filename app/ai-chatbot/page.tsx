"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bot, SendHorizonal } from "lucide-react";

type Message = {
  role: "user" | "bot";
  text: string;
};

export default function LibraryChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: `👋 Welcome to FCE Yauri Library AI Assistant.

You can ask about:
• Library registration
• Borrowing books
• E-library services
• Opening hours
• Renewals & fines
• Research databases`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (text: string) => {
    return text.split("\n").map((line, index) => (
      <p key={index} className="mb-2 leading-relaxed">
        {line}
      </p>
    ));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      });

      const data = await res.json();

      const botMessage: Message = {
        role: "bot",
        text:
          data.reply ||
          "Sorry, I could not generate a response.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "❌ Error connecting to AI service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      {/* CHATBOX */}
      <div className="w-full max-w-[420px] h-[90vh] max-h-[700px] bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="bg-red-900 p-4 flex items-center gap-3">
          
          <Image
            src="/images/fce-logo.jpeg"
            alt="FCE Yauri Logo"
            width={45}
            height={45}
            className="rounded-full object-cover"
          />

          <div>
            <h1 className="font-semibold text-sm md:text-base">
              FCE Yauri Library AI Assistant
            </h1>

            <p className="text-xs text-blue-100">
              Online • Ask library questions only
            </p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {msg.role === "bot" ? (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>

                  <div className="bg-white border shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-700">
                    {formatResponse(msg.text)}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm shadow-sm max-w-[85%]">
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          {/* LOADING */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-white border rounded-2xl px-4 py-3 text-sm text-gray-500 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>

                <span className="ml-2">
                  FCE Yauri Library AI is typing...
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="border-t bg-white p-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
              placeholder="Ask library questions..."
              className="flex-1 bg-transparent outline-none text-sm"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition disabled:opacity-50"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}