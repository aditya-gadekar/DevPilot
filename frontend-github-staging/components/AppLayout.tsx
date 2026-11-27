"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const token = localStorage.getItem("devpilot_token");

    if (!isPublicRoute && !token) {
      router.replace("/login");
      return;
    }

    if (isPublicRoute && token && pathname === "/login") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [pathname, isPublicRoute, router]);

  if (checking) {
    return <div className="min-h-screen bg-[#09090b]" />;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#09090b] text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}