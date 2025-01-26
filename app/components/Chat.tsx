"use client";

import { ChatState, Model } from "../types/chat";
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
    };

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
      };

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
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <MessageList
        messages={chatState.messages}
        isLoading={chatState.isLoading}
        error={chatState.error}
      />
      <div ref={messagesEndRef} />
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
  );
}
