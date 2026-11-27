
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Files,
  MessageSquare,
  Search,
  Settings,
  Bot,
  Sparkles,
  LogOut,
} from "lucide-react";
import { logoutUser } from "@/lib/auth";

const navigation = [
  {
    title: "Workspace",
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        name: "Repositories",
        href: "/repositories",
        icon: FolderGit2,
      },
      {
        name: "Explorer",
        href: "/explorer",
        icon: Files,
      },
    ],
  },
  {
    title: "AI Tools",
    items: [
      {
        name: "AI Chat",
        href: "/chat",
        icon: MessageSquare,
      },
      {
        name: "Semantic Search",
        href: "/search",
        icon: Search,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.replace("/login");
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0c0c0f] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
          <Bot size={21} className="text-white" />
        </div>

        <div>
          <h1 className="text-base font-bold tracking-tight">DevPilot</h1>
          <p className="text-[10px] tracking-wider text-gray-500">
            AI DEVELOPER WORKSPACE
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div key={section.title} className="mb-7">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
              {section.title}
            </p>

            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <Icon size={18} />

                    <span>{item.name}</span>

                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* AI Status */}
      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-blue-400" />

          <span className="text-xs font-medium text-gray-300">
            Local AI Engine
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />

          <span className="text-xs text-gray-500">
            Ollama connected
          </span>
        </div>
      </div>

      {/* Settings & Logout */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            pathname === "/settings"
              ? "bg-blue-500/10 text-blue-400"
              : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
