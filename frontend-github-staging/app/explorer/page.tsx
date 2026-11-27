
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FolderGit,
  FileCode2,
  Search,
  Loader2,
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";

import {
  getRepositories,
  getRepositoryFiles,
  getRepositoryFileContent,
  type Repository,
} from "@/lib/api";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type TreeNode = {
  name: string;
  path: string;
  type: "folder" | "file";
  children: TreeNode[];
};

function buildFileTree(files: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of files) {
    const parts = filePath.split("/").filter(Boolean);
    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      const isFile = index === parts.length - 1;

      let existingNode = currentLevel.find(
        (node) => node.name === part
      );

      if (!existingNode) {
        existingNode = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          children: [],
        };

        currentLevel.push(existingNode);
      }

      if (!isFile) {
        currentLevel = existingNode.children;
      }
    });
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

    nodes.forEach((node) => {
      if (node.type === "folder") {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(root);

  return root;
}

function getLanguage(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    java: "java",
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    c: "c",
    cpp: "cpp",
    h: "c",
    html: "markup",
    css: "css",
    json: "json",
    xml: "xml",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    txt: "text",
  };

  return languageMap[extension || ""] || "text";
}

function TreeItem({
  node,
  level,
  expandedPaths,
  toggleFolder,
  selectedFile,
  selectFile,
}: {
  node: TreeNode;
  level: number;
  expandedPaths: Set<string>;
  toggleFolder: (path: string) => void;
  selectedFile: string | null;
  selectFile: (node: TreeNode) => void;
}) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedFile === node.path;

  return (
    <div>
      <button
        onClick={() => {
          if (node.type === "folder") {
            toggleFolder(node.path);
          } else {
            selectFile(node);
          }
        }}
        className={`w-full flex items-center gap-2 py-1.5 pr-3 text-sm rounded-md transition-colors ${
          isSelected
            ? "bg-blue-500/15 text-blue-400"
            : "text-gray-300 hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {node.type === "folder" ? (
          <>
            {isExpanded ? (
              <ChevronDown size={15} className="shrink-0 text-gray-500" />
            ) : (
              <ChevronRight size={15} className="shrink-0 text-gray-500" />
            )}

            {isExpanded ? (
              <FolderOpen size={16} className="shrink-0 text-blue-400" />
            ) : (
              <Folder size={16} className="shrink-0 text-blue-400" />
            )}
          </>
        ) : (
          <>
            <span className="w-[15px] shrink-0" />
            <File size={15} className="shrink-0 text-gray-500" />
          </>
        )}

        <span className="truncate text-left">{node.name}</span>
      </button>

      {node.type === "folder" && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              expandedPaths={expandedPaths}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              selectFile={selectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorerPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepository, setSelectedRepository] =
    useState<Repository | null>(null);

  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [loadingFileContent, setLoadingFileContent] = useState(false);
  const [fileContentError, setFileContentError] = useState("");

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadRepositories() {
      try {
        setLoading(true);
        const data = await getRepositories();
        setRepositories(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load repositories"
        );
      } finally {
        setLoading(false);
      }
    }

    loadRepositories();
  }, []);

  async function selectRepository(repository: Repository) {
    setSelectedRepository(repository);
    setSelectedFile(null);
    setFileContent("");
    setFileContentError("");
    setSearchTerm("");
    setError("");
    setExpandedPaths(new Set());
    setCopied(false);

    try {
      setLoadingFiles(true);

      const data = await getRepositoryFiles(repository.id);
      setFiles(data);

      // Automatically expand folders when the repository is opened.
      const folders = new Set<string>();

      data.forEach((filePath) => {
        const parts = filePath.split("/");
        let currentPath = "";

        for (let i = 0; i < parts.length - 1; i++) {
          currentPath = currentPath
            ? `${currentPath}/${parts[i]}`
            : parts[i];

          folders.add(currentPath);
        }
      });

      setExpandedPaths(folders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load repository files"
      );
    } finally {
      setLoadingFiles(false);
    }
  }

  function toggleFolder(path: string) {
    setExpandedPaths((previous) => {
      const updated = new Set(previous);

      if (updated.has(path)) {
        updated.delete(path);
      } else {
        updated.add(path);
      }

      return updated;
    });
  }

  async function selectFile(node: TreeNode) {
    if (!selectedRepository) return;

    setSelectedFile(node.path);
    setFileContent("");
    setFileContentError("");
    setCopied(false);

    try {
      setLoadingFileContent(true);

      const result = await getRepositoryFileContent(
        selectedRepository.id,
        node.path
      );

      setFileContent(result.content);
    } catch (err) {
      setFileContentError(
        err instanceof Error ? err.message : "Failed to load file content"
      );
    } finally {
      setLoadingFileContent(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(fileContent);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setFileContentError("Unable to copy code to clipboard.");
    }
  }

  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;

    return files.filter((file) =>
      file.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  const fileTree = useMemo(
    () => buildFileTree(filteredFiles),
    [filteredFiles]
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <FolderGit size={22} className="text-blue-500" />

            <div>
              <h1 className="text-lg font-semibold">DevPilot Explorer</h1>
              <p className="text-xs text-gray-500">
                Explore your repository source code
              </p>
            </div>
          </div>

          {selectedRepository && (
            <button
              onClick={() => {
                setSelectedRepository(null);
                setFiles([]);
                setSelectedFile(null);
                setFileContent("");
                setError("");
                setSearchTerm("");
              }}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5"
            >
              <ArrowLeft size={16} />
              Repositories
            </button>
          )}
        </header>

        {/* Main Area */}
        <main className="flex min-h-0 flex-1 overflow-hidden">
          {/* Repository Selection */}
          {!selectedRepository ? (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold">Repositories</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Select a repository to explore its files.
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center gap-3 py-10 text-gray-400">
                    <Loader2 size={20} className="animate-spin" />
                    Loading repositories...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                    {error}
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-10 text-center">
                    <FolderGit size={36} className="mx-auto mb-3 text-gray-600" />
                    <h3 className="font-medium">No repositories yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Import a repository from the dashboard to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {repositories.map((repository) => (
                      <button
                        key={repository.id}
                        onClick={() => selectRepository(repository)}
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:border-blue-500/30 hover:bg-white/[0.04]"
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <div className="rounded-lg bg-blue-500/10 p-2">
                            <FolderGit size={20} className="text-blue-400" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {repository.name}
                            </h3>
                            <p className="truncate text-xs text-gray-500">
                              {repository.owner}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{repository.sourceFiles} source files</span>
                          <span className="rounded-full bg-white/5 px-2 py-1">
                            {repository.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* File Tree Sidebar */}
              <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-[#0d0d10]">
                <div className="border-b border-white/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <FolderGit size={17} className="text-blue-400" />
                    <span className="truncate text-sm font-medium">
                      {selectedRepository.name}
                    </span>
                  </div>

                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search files..."
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500/40"
                    />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto py-2">
                  {loadingFiles ? (
                    <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-500">
                      <Loader2 size={16} className="animate-spin" />
                      Loading files...
                    </div>
                  ) : error ? (
                    <p className="px-4 py-4 text-sm text-red-400">{error}</p>
                  ) : filteredFiles.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-500">
                      No files found.
                    </p>
                  ) : (
                    fileTree.map((node) => (
                      <TreeItem
                        key={node.path}
                        node={node}
                        level={0}
                        expandedPaths={expandedPaths}
                        toggleFolder={toggleFolder}
                        selectedFile={selectedFile}
                        selectFile={selectFile}
                      />
                    ))
                  )}
                </div>

                <div className="border-t border-white/10 px-4 py-3 text-xs text-gray-500">
                  {filteredFiles.length} files
                </div>
              </aside>

              {/* Code Editor */}
              <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#09090b]">
                {/* Editor Header */}
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0d10] px-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileCode2 size={16} className="shrink-0 text-blue-400" />

                    <span className="truncate text-sm text-gray-300">
                      {selectedFile || "Select a file"}
                    </span>
                  </div>

                  {selectedFile && fileContent && (
                    <button
                      onClick={copyCode}
                      className="ml-3 flex shrink-0 items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-green-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Editor Content */}
                <div className="min-h-0 flex-1 overflow-auto">
                  {!selectedFile ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <FileCode2 size={48} className="mb-4 text-gray-700" />

                      <h3 className="text-lg font-medium text-gray-300">
                        Explore your code
                      </h3>

                      <p className="mt-2 max-w-sm text-sm text-gray-500">
                        Select a file from the sidebar to view its source code.
                      </p>
                    </div>
                  ) : loadingFileContent ? (
                    <div className="flex h-full items-center justify-center gap-3 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      Loading source code...
                    </div>
                  ) : fileContentError ? (
                    <div className="p-6">
                      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                        {fileContentError}
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-full">
                      <SyntaxHighlighter
                        language={getLanguage(selectedFile)}
                        style={oneDark}
                        showLineNumbers
                        wrapLongLines
                        customStyle={{
                          margin: 0,
                          minHeight: "100%",
                          background: "#09090b",
                          padding: "20px 16px",
                          fontSize: "13px",
                          lineHeight: "1.7",
                        }}
                        lineNumberStyle={{
                          color: "#52525b",
                          minWidth: "3em",
                          paddingRight: "1em",
                          textAlign: "right",
                          userSelect: "none",
                        }}
                      >
                        {fileContent}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>

                {/* Editor Footer */}
                {selectedFile && !loadingFileContent && !fileContentError && (
                  <div className="flex h-8 shrink-0 items-center justify-between border-t border-white/10 bg-[#0d0d10] px-4 text-xs text-gray-500">
                    <span>{getLanguage(selectedFile)}</span>
                    <span>
                      {fileContent.split("\n").length} lines
                    </span>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
