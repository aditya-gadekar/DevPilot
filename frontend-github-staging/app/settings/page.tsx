
"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Cpu,
  Brain,
  Database,
  Server,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Monitor,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

export default function SettingsPage() {
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const [checking, setChecking] = useState(false);

  async function checkBackend() {
    setChecking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/repositories`, {
        cache: "no-store",
      });

      if (response.ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    checkBackend();
  }, []);

  const statusColor =
    backendStatus === "online"
      ? "text-green-400"
      : backendStatus === "offline"
      ? "text-red-400"
      : "text-yellow-400";

  const statusText =
    backendStatus === "online"
      ? "Connected"
      : backendStatus === "offline"
      ? "Disconnected"
      : "Checking connection...";

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>

            <span className="text-sm text-blue-400 font-medium">
              SYSTEM CONFIGURATION
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="text-gray-400 mt-2">
            Monitor your local AI environment and DevPilot infrastructure.
          </p>
        </div>

        {/* Backend Status */}
        <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-blue-400" />

              <div>
                <h2 className="font-semibold">Backend API</h2>
                <p className="text-sm text-gray-500">
                  Spring Boot · Port 8080
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${statusColor}`}>
              {backendStatus === "online" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : backendStatus === "offline" ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <RefreshCw className="w-4 h-4 animate-spin" />
              )}

              <span className="text-sm font-medium">{statusText}</span>
            </div>
          </div>

          <button
            onClick={checkBackend}
            disabled={checking}
            className="mt-5 flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
        </div>

        {/* AI Configuration */}
        <div>
          <h2 className="text-xl font-semibold mb-4">AI Configuration</h2>

          <div className="grid md:grid-cols-2 gap-4">

            {/* Chat Model */}
            <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>

                <div>
                  <h3 className="font-semibold">Chat Model</h3>
                  <p className="text-sm text-gray-500">Local LLM</p>
                </div>
              </div>

              <div className="bg-[#09090b] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">MODEL</p>
                <p className="font-mono text-purple-300">llama3.2</p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Running locally with Ollama
              </div>
            </div>

            {/* Embedding Model */}
            <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Cpu className="w-5 h-5 text-blue-400" />
                </div>

                <div>
                  <h3 className="font-semibold">Embedding Model</h3>
                  <p className="text-sm text-gray-500">Vector embeddings</p>
                </div>
              </div>

              <div className="bg-[#09090b] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">MODEL</p>
                <p className="font-mono text-blue-300">nomic-embed-text</p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Used for semantic code search
              </div>
            </div>

          </div>
        </div>

        {/* Infrastructure */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Infrastructure</h2>

          <div className="grid md:grid-cols-2 gap-4">

            {/* Database */}
            <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-green-400" />

                <div>
                  <h3 className="font-semibold">Database</h3>
                  <p className="text-sm text-gray-500">PostgreSQL + pgvector</p>
                </div>
              </div>

              <div className="bg-[#09090b] border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Version</span>
                  <span>PostgreSQL 16</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Host Port</span>
                  <span className="font-mono">5433</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vector Extension</span>
                  <span className="text-green-400">pgvector</span>
                </div>
              </div>
            </div>

            {/* System */}
            <div className="bg-[#111114] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-5 h-5 text-orange-400" />

                <div>
                  <h3 className="font-semibold">Development Environment</h3>
                  <p className="text-sm text-gray-500">Local Infrastructure</p>
                </div>
              </div>

              <div className="bg-[#09090b] border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frontend</span>
                  <span>Next.js · Port 3000</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Backend</span>
                  <span>Spring Boot · Port 8080</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">AI Runtime</span>
                  <span>Ollama · Port 11434</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#111114] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>

            <div>
              <h3 className="font-medium">DevPilot</h3>
              <p className="text-sm text-gray-500">
                AI-powered GitHub Repository Assistant
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 mt-4 pt-4 flex justify-between text-xs text-gray-500">
            <span>Version 1.0.0</span>
            <span>Built with local AI infrastructure</span>
          </div>
        </div>

      </div>
    </div>
  );
}
