const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email?: string;
  name?: string;
}

export async function registerUser(
  data: RegisterRequest
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Registration failed");
  }

  return response.json();
}

export async function loginUser(
  data: LoginRequest
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Login failed");
  }

  return response.json();
}

export function saveToken(token: string): void {
  localStorage.setItem("devpilot_token", token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("devpilot_token");
}

export function logoutUser(): void {
  localStorage.removeItem("devpilot_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}