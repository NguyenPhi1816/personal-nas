"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomFileManager from "@/src/components/files/explorer/CustomFileManager";
import { useAuth } from "@/src/providers/auth-context";

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div style={{ padding: "20px" }}>Redirecting to login...</div>;
  }

  return <CustomFileManager userName={user?.username} onLogout={logout} />;
}
