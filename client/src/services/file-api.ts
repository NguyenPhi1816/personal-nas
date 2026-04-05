import { env } from "@/src/lib/env";
import type { FileItem } from "@/src/types/file.type";
import { normalizeApiPath } from "@/src/lib/path";
import { getToken } from "@/src/lib/token-storage";
import { httpClient } from "@/src/services/http-client";

function apiBase(): string {
  return env.apiBaseUrl.replace(/\/$/, "");
}

function buildAuthenticatedUrl(
  endpoint: string,
  params: Record<string, string | number>,
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  const token = getToken();
  if (token) {
    searchParams.set("token", token);
  }

  return `${apiBase()}${endpoint}?${searchParams.toString()}`;
}

export const fileApi = {
  async list(path = "/"): Promise<FileItem[]> {
    const safePath = normalizeApiPath(path);
    const { data } = await httpClient.get<FileItem[]>("/files", {
      params: { path: safePath },
    });
    return Array.isArray(data) ? data : [];
  },

  async upload(file: File, path = "/"): Promise<{ path: string }> {
    const safePath = normalizeApiPath(path);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", safePath);

    const { data } = await httpClient.post<{ path: string }>(
      "/files/upload",
      formData,
    );
    return data;
  },

  async delete(path: string): Promise<{ success: boolean }> {
    const safePath = normalizeApiPath(path);
    const { data } = await httpClient.delete<{ success: boolean }>("/files", {
      data: { path: safePath },
    });
    return data;
  },

  async rename(oldPath: string, newName: string): Promise<{ newPath: string }> {
    const safeOldPath = normalizeApiPath(oldPath);
    const { data } = await httpClient.post<{ newPath: string }>(
      "/files/rename",
      {
        oldPath: safeOldPath,
        newName,
      },
    );
    return data;
  },

  async createFolder(
    path: string,
    folderName: string,
  ): Promise<{ path: string }> {
    const safePath = normalizeApiPath(path);
    const { data } = await httpClient.post<{ path: string }>("/files/folder", {
      path: safePath,
      folderName,
    });
    return data;
  },

  download(path: string): void {
    const safePath = normalizeApiPath(path);
    const url = buildAuthenticatedUrl("/files/download", { path: safePath });
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  },

  getDownloadUrl(path: string): string {
    const safePath = normalizeApiPath(path);
    return buildAuthenticatedUrl("/files/download", { path: safePath });
  },

  getThumbnailUrl(path: string, width = env.defaultThumbnailWidth): string {
    const safePath = normalizeApiPath(path);
    return buildAuthenticatedUrl("/images/thumbnail", {
      path: safePath,
      width,
    });
  },
};
