import type { PreviewType } from "@/src/types/file.type";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov", "avi"]);
const RAW_EXTENSIONS = new Set(["arw", "cr2", "nef", "dng", "raf", "orf"]);

export function normalizeApiPath(value?: string): string {
  if (!value) return ".";

  const path = value.trim().replace(/\\/g, "/");

  if (!path || path === "/" || path === ".") return ".";
  if (path === "/body" || path === "body") return ".";

  return path.startsWith("/") ? path.slice(1) : path;
}

export function normalizeUiPath(value?: string): string {
  const path = String(value ?? "")
    .trim()
    .replace(/\\/g, "/");
  if (!path || path === "." || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function detectPreviewType(
  filePath?: string | null,
): PreviewType | null {
  if (!filePath) return null;

  const extension = filePath.toLowerCase().split(".").pop() ?? "";

  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (RAW_EXTENSIONS.has(extension)) return "raw";

  return null;
}
