
"use client";

import { useEffect, useState } from "react";
import {
  getRepositories,
  sendGeneralChat,
  sendRepositoryChat,
  type Repository,
} from "@/lib/api";
import {
  Bot,
  Send,
  Loader2,
  MessageSquare,
  GitBranch,
  Plus,
} from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState("");
  const [mode, setMode] = useState<"general" | "repository">("general");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: Date.now(),
      role: "assistant",
      content:
        "Hello! I'm DevPilot AI. Ask me about programming, development, or your repository.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load repositories using authenticated API helper
  useEffect(() => {
    async function loadRepositories() {
      try {
        const data = await getRepositories();
        setRepositories(data);
      } catch (err) {
        console.error("Repository loading error:", err);
        setError("Failed to load repositories. Please check your authentication.");
      }
    }

    loadRepositories();
  }, []);

  // Send message
  async function handleSendMessage() {
    const message = input.trim();

    if (!message || loading) return;

    if (mode === "repository" && !selectedRepository) {
      setError("Please select a repository first.");
      return;
    }

    setError("");
    setInput("");
    setLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      const data =
        mode === "general"
          ? await sendGeneralChat(message)
          : await sendRepositoryChat(Number(selectedRepository), message);

      const assistantContent =
        data.response ?? data.message ?? data.content ?? "No response received.";

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: assistantContent,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err) {
      console.error("Chat request error:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to get AI response.";

      setError(errorMessage);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 2,
          role: "assistant",
          content:
            "Sorry, I couldn't process your request. Please check the backend and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleNewChat() {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: "New chat started. How can I help you?",
      },
    ]);
    setError("");
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col bg-[#09090b] text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
            <Bot size={22} />
          </div>

          <div>
            <h1 className="text-lg font-semibold">DevPilot AI Chat</h1>
            <p className="text-xs text-gray-400">
              Powered by your local AI engine
            </p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Chat Mode */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-6 py-3">
        <button
          onClick={() => {
            setMode("general");
            setError("");
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
            mode === "general"
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <MessageSquare size={16} />
          General Chat
        </button>

        <button
          onClick={() => {
            setMode("repository");
            setError("");
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
            mode === "repository"
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <GitBranch size={16} />
          Repository Chat
        </button>

        {mode === "repository" && (
          <select
            value={selectedRepository}
            onChange={(e) => setSelectedRepository(e.target.value)}
            className="min-w-[220px] rounded-lg border border-white/10 bg-[#111114] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="">Select Repository</option>

            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                <Bot size={18} />
              </div>
            )}

            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "border border-white/10 bg-[#121216] text-gray-200"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <Bot size={18} />
            </div>

            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              DevPilot is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-white/10 bg-[#121216] p-3 focus-within:border-blue-500/50">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              mode === "repository"
                ? "Ask something about your repository..."
                : "Ask DevPilot anything about development..."
            }
            rows={1}
            className="max-h-40 min-h-[44px] flex-1 resize-y bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-gray-500"
          />

          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            title="Send message"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-gray-500">
          DevPilot uses a local AI engine. AI responses may contain inaccuracies.
        </p>
      </div>
    </div>
  );
}
