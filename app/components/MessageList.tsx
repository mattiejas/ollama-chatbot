import { ChatState, Message } from "../types/chat";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export default function MessageList({ messages, isLoading, error }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 rounded-lg ${message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"} max-w-[80%] ${
            message.role === "assistant" && isLoading && message.id === messages[messages.length - 1].id ? "animate-fadeIn" : ""
          }`}
        >
          <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
            {message.role === "assistant" && isLoading && message.id === messages[messages.length - 1].id ? (
              <div className="whitespace-break-spaces">
                {message.content.split(/(?<=\s)/).map((word, index) => (
                  <span key={`${index}-${word}`} className="inline-block animate-fadeIn">
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
            {message.role === "assistant" && isLoading && message.id === messages[messages.length - 1].id && (
              <span className="inline-block w-2 h-4 ml-1 bg-gray-600 animate-cursor"></span>
            )}
          </div>
        </div>
      ))}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 max-w-[80%]">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
