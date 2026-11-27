
"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  FolderGit,
  GitBranch,
  Code2,
  Search,
  RefreshCw,
  Loader2,
  Sparkles,
  Plus,
} from "lucide-react";

import {
  getRepositories,
  indexRepository,
  type Repository,
} from "@/lib/api";

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [indexingRepoId, setIndexingRepoId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadRepositories();
  }, []);

  async function loadRepositories() {
    try {
      setRefreshing(true);
      const data = await getRepositories();
      setRepositories(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load repositories"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleIndexRepository(id: number) {
    setIndexingRepoId(id);
    setError("");
    setSuccess("");

    try {
      await indexRepository(id);

      const updated = await getRepositories();
      setRepositories(updated);

      setSuccess("Repository indexed successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to index repository"
      );
    } finally {
      setIndexingRepoId(null);
    }
  }

  const filteredRepositories = repositories.filter((repo) => {
    const search = searchTerm.toLowerCase();

    return (
      repo.name.toLowerCase().includes(search) ||
      repo.owner.toLowerCase().includes(search)
    );
  });

  const indexedCount = repositories.filter((repo =>
    repo.status?.toLowerCase().includes("index")
  )).length;

  const totalFiles = repositories.reduce(
    (total, repo) => total + (repo.sourceFiles || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#09090b] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-gray-500">Workspace</p>
            <h1 className="text-3xl font-bold">Repositories</h1>
            <p className="mt-2 text-gray-400">
              Manage, explore and index your GitHub repositories.
            </p>
          </div>

          <button
            onClick={loadRepositories}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
            {success}
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Repositories"
            value={repositories.length}
            icon={<FolderGit size={20} />}
          />

          <StatCard
            title="Indexed Repositories"
            value={indexedCount}
            icon={<Sparkles size={20} />}
          />

          <StatCard
            title="Source Files"
            value={totalFiles}
            icon={<Code2 size={20} />}
          />
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search repositories..."
              className="w-full rounded-xl border border-white/10 bg-[#0e121a] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500/40"
            />
          </div>
        </div>

        {/* REPOSITORY LIST */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e121a]">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-semibold">Imported Repositories</h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredRepositories.length} repositories found
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              Loading repositories...
            </div>
          ) : filteredRepositories.length === 0 ? (
            <div className="p-16 text-center">
              <FolderGit size={40} className="mx-auto mb-4 text-gray-600" />

              <h3 className="font-medium">
                {searchTerm ? "No matching repositories" : "No repositories yet"}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {searchTerm
                  ? "Try searching with a different name."
                  : "Import a GitHub repository from your Dashboard."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredRepositories.map((repo) => {
                const isIndexing = indexingRepoId === repo.id;
                const isIndexed = repo.status?.toLowerCase().includes("index");

                return (
                  <div
                    key={repo.id}
                    className="p-5 transition hover:bg-white/[0.02] sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Repository Information */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="rounded-xl border border-white/10 bg-[#151b26] p-3">
                          <FolderGit size={22} className="text-blue-400" />
                        </div>

                        <div className="min-w-0">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-wrap items-center gap-1 font-semibold transition hover:text-blue-400"
                          >
                            {repo.owner}/{repo.name}
                            <ArrowUpRight size={14} />
                          </a>

                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <GitBranch size={13} />
                              {repo.defaultBranch || "unknown branch"}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Code2 size={13} />
                              {repo.sourceFiles || 0} files
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* STATUS */}
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          isIndexed
                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                            : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {repo.status || "IMPORTED"}
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-5 flex justify-end">
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
      </div>
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e121a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>

        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}
