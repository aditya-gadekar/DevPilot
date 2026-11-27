
"use client";

import { getToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  Search,
  Code2,
  FolderGit2,
  Loader2,
  FileCode,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Repository {
  id: number;
  name: string;
  fullName?: string;
  url?: string;
}

interface SearchResult {
  filePath: string;
  startLine?: number;
  endLine?: number;
  content: string;
}

export default function SemanticSearchPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRepositories();
  }, []);

  // ==========================================
  // Load repositories with JWT authentication
  // ==========================================
  async function loadRepositories() {
    setLoadingRepositories(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/repositories`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Authentication failed. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load repositories (${response.status})`
        );
      }

      const data: Repository[] = await response.json();

      setRepositories(data);

      if (data.length > 0) {
        setSelectedRepository(String(data[0].id));
      } else {
        setSelectedRepository("");
      }
    } catch (err) {
      console.error("Repository loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load repositories. Check your backend."
      );
    } finally {
      setLoadingRepositories(false);
    }
  }

  // ==========================================
  // Semantic Search with JWT authentication
  // ==========================================
  async function handleSearch(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }

    if (!selectedRepository) {
      setError("Please select a repository.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            repositoryId: Number(selectedRepository),
            query: query.trim(),
            limit: 10,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Authentication failed. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Semantic search failed (${response.status})`
        );
      }

      const data: SearchResult[] = await response.json();

      setResults(data);
    } catch (err) {
      console.error("Semantic search error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Search failed. Please check if the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Search className="w-6 h-6 text-blue-400" />
            </div>

            <span className="text-sm text-blue-400 font-medium">
              AI POWERED CODE SEARCH
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Semantic Search
          </h1>

          <p className="text-gray-400 mt-2">
            Find relevant code using natural language instead of keywords.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-[#111114] border border-white/10 rounded-2xl p-5 md:p-6 space-y-5"
        >
          {/* Repository Selector */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Select Repository
            </label>

            <div className="flex items-center gap-3 bg-[#09090b] border border-white/10 rounded-xl px-4">
              <FolderGit2 className="w-5 h-5 text-gray-500" />

              <select
                value={selectedRepository}
                onChange={(e) =>
                  setSelectedRepository(e.target.value)
                }
                disabled={loadingRepositories || repositories.length === 0}
                className="w-full bg-transparent py-3 outline-none text-white disabled:opacity-50"
              >
                {loadingRepositories && (
                  <option value="">Loading repositories...</option>
                )}

                {!loadingRepositories && repositories.length === 0 && (
                  <option value="">No repositories available</option>
                )}

                {repositories.map((repo) => (
                  <option
                    key={repo.id}
                    value={String(repo.id)}
                    className="bg-[#111114]"
                  >
                    {repo.fullName || repo.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              What are you looking for?
            </label>

            <div className="flex items-center gap-3 bg-[#09090b] border border-white/10 rounded-xl px-4 focus-within:border-blue-500/50">
              <Search className="w-5 h-5 text-gray-500 shrink-0" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. How does the authentication system work?"
                className="w-full bg-transparent py-4 outline-none text-white placeholder:text-gray-600"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingRepositories ||
                  !query.trim() ||
                  !selectedRepository
                }
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg font-medium transition shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}

                <span>{loading ? "Searching" : "Search"}</span>
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 mr-1">
              Try:
            </span>

            {[
              "How does HTTP routing work?",
              "Where is authentication handled?",
              "How are errors handled?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="text-xs text-gray-400 border border-white/10 hover:border-blue-500/40 hover:text-blue-400 rounded-full px-3 py-1.5 transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* Results Header */}
        {results.length > 0 && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Search Results
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Found {results.length} relevant code chunks
              </p>
            </div>

            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Code results
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={`${result.filePath}-${index}`}
              className="bg-[#111114] border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition"
            >
              {/* File Header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.02] border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className="w-4 h-4 text-blue-400 shrink-0" />

                  <span className="text-sm font-mono text-blue-300 truncate">
                    {result.filePath}
                  </span>
                </div>

                {result.startLine != null && (
                  <span className="text-xs text-gray-500 shrink-0">
                    Lines {result.startLine}
                    {result.endLine != null &&
                      `–${result.endLine}`}
                  </span>
                )}
              </div>

              {/* Code */}
              <pre className="p-4 overflow-x-auto text-sm leading-6 text-gray-300 whitespace-pre-wrap break-words">
                <code>{result.content}</code>
              </pre>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading &&
          results.length === 0 &&
          !error && (
            <div className="text-center border border-dashed border-white/10 rounded-2xl py-16">
              <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                <Search className="w-7 h-7 text-gray-500" />
              </div>

              <h3 className="font-medium text-gray-300">
                Search your codebase
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Enter a question above to discover relevant code.
              </p>
            </div>
          )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-3 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Searching your codebase...</span>
          </div>
        )}

      </div>
    </div>
  );
}
