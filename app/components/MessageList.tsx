import { Message } from "../types/chat";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface MessageProps {
  message: Message;
  isLoading: boolean;
  isLatest: boolean;
}

const UserMessage = ({ message }: MessageProps) => (
  <div className="group relative p-4 rounded transition-all bg-violet-50 ml-auto max-w-[85%]">
    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
  </div>
);

const AssistantMessage = ({ message, isLoading, isLatest }: MessageProps) => (
  <div className={`p-4 rounded transition-all bg-slate-100 max-w-[85%] ${isLoading && isLatest ? "animate-fadeIn" : ""}`}>
    <div className="text-sm prose prose-slate max-w-none dark:prose-invert prose-pre:my-0 prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2">
      {isLoading && isLatest ? (
        <div className="whitespace-break-spaces inline-block">
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
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                  className="!my-4 !bg-gray-900 !rounded-xl !p-4 !shadow-lg"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={`${className} bg-gray-100 px-1.5 py-0.5 rounded-md text-gray-800`} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      )}
    </div>
  </div>
);

export default function MessageList({ messages, isLoading, error }: MessageListProps) {
  function isLatest(message: Message) {
    return message.id === messages[messages.length - 1].id;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message) => {
        return message.role === "user" ? (
          <UserMessage key={message.id} message={message} isLoading={isLoading} isLatest={isLatest(message)} />
        ) : (
          <AssistantMessage key={message.id} message={message} isLoading={isLoading} isLatest={isLatest(message)} />
        );
      })}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 max-w-[85%]">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
