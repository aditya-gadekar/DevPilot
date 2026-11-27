
"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Code2,
  FolderGit,
  GitBranch,
  Plus,
  Search,
  Sparkles,
  Terminal,
  X,
  Database,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  importRepository,
  getRepositories,
  indexRepository,
  type Repository,
} from "@/lib/api";

export default function Home() {
  const [showImport, setShowImport] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRepositories, setFetchingRepositories] = useState(true);
  const [indexingRepoId, setIndexingRepoId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load repositories on page load
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setFetchingRepositories(true);
      const data = await getRepositories();
      setRepositories(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch repositories"
      );
    } finally {
      setFetchingRepositories(false);
    }
  };

  // Import repository
  const handleImportRepository = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const repository = await importRepository(repoUrl.trim());

      setRepositories((prev) => {
        const exists = prev.some((repo) => repo.id === repository.id);

        if (exists) {
          return prev.map((repo) =>
            repo.id === repository.id ? repository : repo
          );
        }

        return [repository, ...prev];
      });

      setRepoUrl("");
      setShowImport(false);
      setSuccess(`Repository ${repository.name} imported successfully!`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import repository"
      );
    } finally {
      setLoading(false);
    }
  };

  // Index repository
  const handleIndexRepository = async (id: number) => {
    setIndexingRepoId(id);
    setError("");
    setSuccess("");

    try {
      await indexRepository(id);

      const updatedRepositories = await getRepositories();
      setRepositories(updatedRepositories);

      setSuccess("Repository indexed successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to index repository"
      );
    } finally {
      setIndexingRepoId(null);
    }
  };

  // Dashboard statistics
  const totalRepositories = repositories.length;

  const indexedRepositories = repositories.filter((repo) =>
    repo.status?.toLowerCase().includes("index")
  ).length;

  const totalSourceFiles = repositories.reduce(
    (total, repo) => total + (repo.sourceFiles || 0),
    0
  );

  return (
    <main className="min-h-screen w-full bg-[#090b10] text-white">
      <section className="min-h-screen w-full overflow-y-auto p-6 md:p-10">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-sm text-gray-500">Overview</p>

              <h2 className="text-3xl font-bold">Dashboard</h2>

              <p className="mt-2 text-gray-400">
                Your repositories and AI development workspace.
              </p>
            </div>

            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setShowImport(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
            >
              <Plus size={18} />
              Import Repository
            </button>
          </header>

          {/* FEEDBACK */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              <X size={18} className="mt-0.5 shrink-0" />

              <div className="flex-1 text-sm">{error}</div>

              <button onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-300">
              <CheckCircle2 size={18} />

              <span className="text-sm">{success}</span>

              <button
                className="ml-auto"
                onClick={() => setSuccess("")}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* STAT CARDS */}
          <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Repositories"
              value={totalRepositories}
              icon={<FolderGit size={20} />}
              color="blue"
            />

            <StatCard
              title="Indexed Projects"
              value={indexedRepositories}
              icon={<Database size={20} />}
              color="purple"
            />

            <StatCard
              title="Code Files"
              value={totalSourceFiles}
              icon={<Code2 size={20} />}
              color="green"
            />

            <StatCard
              title="AI Engine"
              value="Local"
              icon={<Bot size={20} />}
              color="orange"
            />
          </div>

          {/* QUICK ACTIONS */}
          <div className="mb-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <ActionCard
              icon={<Search size={20} />}
              title="Semantic Code Search"
              description="Search your code using natural language."
            />

            <ActionCard
              icon={<Bot size={20} />}
              title="Ask AI About Code"
              description="Get answers about your repositories."
            />

            <ActionCard
              icon={<Terminal size={20} />}
              title="Explore Repository"
              description="Browse files and understand structure."
            />
          </div>

          {/* REPOSITORIES */}
          <div className="rounded-2xl border border-white/10 bg-[#0e121a]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
              <div>
                <h3 className="text-lg font-semibold">Your Repositories</h3>

                <p className="mt-1 text-sm text-gray-500">
                  Imported GitHub projects
                </p>
              </div>

              <button
                onClick={fetchRepositories}
                disabled={fetchingRepositories}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={fetchingRepositories ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {fetchingRepositories ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="mx-auto mb-3 animate-spin" />
                Loading repositories...
              </div>
            ) : repositories.length === 0 ? (
              <div className="p-12 text-center">
                <FolderGit size={40} className="mx-auto mb-4 text-gray-600" />

                <h3 className="font-medium">No repositories yet</h3>

                <p className="mt-2 text-sm text-gray-500">
                  Import a GitHub repository to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {repositories.map((repo) => {
                  const isIndexing = indexingRepoId === repo.id;

                  const isIndexed = repo.status?.toLowerCase().includes("index");

                  return (
                    <div
                      key={repo.id}
                      className="flex flex-col gap-4 p-6 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl border border-white/10 bg-[#151b26] p-3">
                            <FolderGit size={20} className="text-blue-400" />
                          </div>

                          <div>
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold transition hover:text-blue-400"
                            >
                              {repo.owner}/{repo.name}

                              <ArrowUpRight
                                size={14}
                                className="ml-1 inline"
                              />
                            </a>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <GitBranch size={13} />
                                {repo.defaultBranch || "unknown"}
                              </span>

                              <span className="flex items-center gap-1">
                                <Code2 size={13} />
                                {repo.sourceFiles || 0} files
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${
                            isIndexed
                              ? "border-green-500/20 bg-green-500/10 text-green-400"
                              : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {repo.status}
                        </span>
                      </div>

                      {/* INDEX BUTTON */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleIndexRepository(repo.id)}
                          disabled={indexingRepoId !== null}
                          className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-600/10 px-4 py-2 text-sm text-blue-400 transition hover:bg-blue-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isIndexing ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Indexing...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} />
                              {isIndexed
                                ? "Re-index Repository"
                                : "Index Repository"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <footer className="mt-10 text-center text-xs text-gray-600">
            DevPilot • Local AI • Built for developers
          </footer>
        </div>
      </section>

      {/* IMPORT MODAL */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111722] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Import Repository</h3>

              <button
                onClick={() => setShowImport(false)}
                disabled={loading}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mb-2 block text-sm text-gray-400">
              GitHub Repository URL
            </label>

            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full rounded-xl border border-white/10 bg-[#090b10] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Enter the URL of a public GitHub repository.
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowImport(false)}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleImportRepository}
                disabled={loading || !repoUrl.trim()}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Importing...
                  </span>
                ) : (
                  "Import Repository"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    green: "text-green-400 bg-green-500/10",
    orange: "text-orange-400 bg-orange-500/10",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e121a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>

        <div className={`rounded-lg p-2 ${colors[color] || colors.blue}`}>
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button className="rounded-2xl border border-white/10 bg-[#0e121a] p-5 text-left transition hover:border-blue-500/30 hover:bg-blue-500/[0.03]">
      <div className="mb-4 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400">
        {icon}
      </div>

      <h3 className="mb-2 font-semibold">{title}</h3>

      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}
