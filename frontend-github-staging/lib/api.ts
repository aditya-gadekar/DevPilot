const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface Repository {
  id: number;
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
  localPath: string;
  status: string;
  totalFiles: number;
  sourceFiles: number;
  importedAt: string;
}

export interface ImportRepositoryRequest {
  url: string;
}

export interface RepositoryFileContent {
  repositoryId: number;
  repositoryName: string;
  filePath: string;
  fileName: string;
  content: string;
}

/**
 * Central API request handler
 * Automatically attaches JWT token when available.
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("devpilot_token")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ==========================================
// Repository APIs
// ==========================================

// Import GitHub repository
export async function importRepository(
  url: string
): Promise<Repository> {
  return request<Repository>("/api/repositories/import", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

// Fetch all repositories
export async function getRepositories(): Promise<Repository[]> {
  return request<Repository[]>("/api/repositories");
}

// Fetch repository details
export async function getRepository(id: number): Promise<Repository> {
  return request<Repository>(`/api/repositories/${id}`);
}

// Fetch repository structure
export async function getRepositoryStructure(
  id: number
): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(
    `/api/repositories/${id}/structure`
  );
}

// Fetch repository files
export async function getRepositoryFiles(
  id: number
): Promise<string[]> {
  return request<string[]>(`/api/repositories/${id}/files`);
}

// Fetch repository chunks
export async function getRepositoryChunks(
  id: number
): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(
    `/api/repositories/${id}/chunks`
  );
}

// Index repository
export async function indexRepository(
  id: number
): Promise<unknown> {
  return request(`/api/repositories/${id}/index`, {
    method: "POST",
  });
}

// Fetch repository file content
export async function getRepositoryFileContent(
  id: number,
  path: string
): Promise<RepositoryFileContent> {
  return request<RepositoryFileContent>(
    `/api/repositories/${id}/file?path=${encodeURIComponent(path)}`
  );
}
// ==========================================
// AI Chat APIs
// ==========================================

export interface ChatResponse {
  response?: string;
  message?: string;
  content?: string;
}

// General AI chat
export async function sendGeneralChat(
  message: string
): Promise<ChatResponse> {
  return request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// Repository AI chat
export async function sendRepositoryChat(
  repositoryId: number,
  message: string
): Promise<ChatResponse> {
  return request<ChatResponse>(
    `/api/chat/repositories/${repositoryId}`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
}