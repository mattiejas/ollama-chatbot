import { Model } from "../types/chat";

interface ChatInputProps {
  models: Model[];
  selectedModel: string;
  input: string;
  isLoading: boolean;
  onModelChange: (model: string) => void;
  onInputChange: (input: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatInput({
  models,
  selectedModel,
  input,
  isLoading,
  onModelChange,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium shadow-sm hover:border-blue-400 transition-colors cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.5rem]"
      >
        {models.map((model) => (
          <option key={model.value} value={model.value} className="py-2">
            {model.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  );
}