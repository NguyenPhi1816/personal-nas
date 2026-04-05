import { fileApi } from "@/src/services/file-api";
import type {
  FileItem as ApiFileItem,
  FileEntry,
  FileKind,
} from "@/src/types/file.type";
import { detectPreviewType, normalizeUiPath } from "@/src/lib/path";

const DOC_EXTENSIONS = new Set(["doc", "docx", "txt", "rtf"]);
const SHEET_EXTENSIONS = new Set(["xls", "xlsx", "csv"]);
const PDF_EXTENSIONS = new Set(["pdf"]);

function detectFileKind(item: ApiFileItem): FileKind {
  if (item.type === "directory") {
    return "folder";
  }

  const previewType = detectPreviewType(item.path);
  if (previewType === "image") return "image";
  if (previewType === "video") return "video";
  if (previewType === "raw") return "raw";

  const extension = item.name.toLowerCase().split(".").pop() ?? "";

  if (PDF_EXTENSIONS.has(extension)) return "pdf";
  if (DOC_EXTENSIONS.has(extension)) return "doc";
  if (SHEET_EXTENSIONS.has(extension)) return "spreadsheet";

  return "generic";
}

export function toFileEntry(item: ApiFileItem): FileEntry {
  const kind = detectFileKind(item);
  const normalizedPath = normalizeUiPath(item.path);
  const thumbnailKinds = new Set<FileKind>(["image", "video", "raw"]);

  return {
    id: normalizedPath,
    name: item.name,
    path: normalizedPath,
    type: item.type,
    size: item.size,
    createdAt: item.createdAt,
    kind,
    previewUrl: thumbnailKinds.has(kind)
      ? fileApi.getThumbnailUrl(item.path, 600)
      : undefined,
  };
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  const digits = value >= 100 || index === 0 ? 0 : 1;

  return `${value.toFixed(digits)} ${units[index]}`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function buildBreadcrumbs(
  path: string,
): Array<{ label: string; path: string }> {
  const normalized = normalizeUiPath(path);
  if (normalized === "/") {
    return [{ label: "My Cloud", path: "/" }];
  }

  const segments = normalized.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; path: string }> = [
    {
      label: "My Cloud",
      path: "/",
    },
  ];

  let current = "";
  segments.forEach((segment) => {
    current += `/${segment}`;
    crumbs.push({
      label: segment,
      path: current,
    });
  });

  return crumbs;
}
