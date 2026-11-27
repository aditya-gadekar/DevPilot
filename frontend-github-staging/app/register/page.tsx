
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, saveToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({ name, email, password });

      if (response.token) {
        saveToken(response.token);
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b1120] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
            D
          </div>

          <h1 className="text-3xl font-bold text-white">
            Create your account
          </h1>

          <p className="mt-2 text-gray-400">
            Get started with your AI developer workspace
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
