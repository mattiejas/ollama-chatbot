"use client";

import { ChatState, Message, Model } from "../types/chat";
import { useEffect, useRef, useState } from "react";

import ChatInput from "./ChatInput";
import MessageList from "./MessageList";

interface ChatProps {
  models: Model[];
}

export default function Chat({ models }: ChatProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]?.value || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    } satisfies Message;

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, model: selectedModel }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      } satisfies Message;

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: true,
      }));

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        setChatState((prev) => {
          const lastMessage = prev.messages[prev.messages.length - 1];
          const updatedMessages = prev.messages.slice(0, -1);
          return {
            ...prev,
            messages: [...updatedMessages, { ...lastMessage, content: lastMessage.content + text }],
          };
        });
      }

      setChatState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to get response from the AI",
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-hidden container max-w-4xl mx-auto p-16">
        <header className="flex justify-between items-center pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Ollama Chatbot</h2>
        </header>
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <MessageList messages={chatState.messages} isLoading={chatState.isLoading} error={chatState.error} />
          <div ref={messagesEndRef} />
          <div className="border-t border-gray-100 bg-white p-4">
            <ChatInput
              models={models}
              selectedModel={selectedModel}
              input={input}
              isLoading={chatState.isLoading}
              onModelChange={setSelectedModel}
              onInputChange={setInput}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
