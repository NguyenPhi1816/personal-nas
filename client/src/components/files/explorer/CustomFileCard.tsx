import {
  Download,
  Edit,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { formatDate, formatFileSize } from "../file-entry";
import { cn } from "@/src/lib/cn";
import { FileEntry } from "@/src/types/file.type";

interface CustomFileCardProps {
  item: FileEntry;
  viewMode: "grid" | "list";
  onOpen: (entry: FileEntry) => void;
  onRename: (entry: FileEntry) => void;
  onDownload: (entry: FileEntry) => void;
  onDelete: (entry: FileEntry) => void;
}

function renderIcon(item: FileEntry) {
  if (item.kind === "folder") {
    return <Folder className="h-16 w-16 fill-primary text-primary" />;
  }

  if (item.kind === "image" || item.kind === "raw") {
    return <FileImage className="h-16 w-16 text-sky-400" />;
  }

  if (item.kind === "video") {
    return <FileVideo className="h-16 w-16 text-indigo-400" />;
  }

  if (item.kind === "spreadsheet") {
    return <FileCode className="h-16 w-16 text-green-500" />;
  }

  if (item.kind === "pdf") {
    return (
      <div className="relative">
        <FileText className="h-16 w-16 text-red-500" />
        <span className="absolute inset-0 mt-2 flex items-center justify-center text-[10px] font-bold text-white">
          PDF
        </span>
      </div>
    );
  }

  if (item.kind === "doc") {
    return <FileText className="h-16 w-16 text-blue-400" />;
  }

  return <FileText className="h-16 w-16 text-slate-500 dark:text-slate-300" />;
}

export function CustomFileCard({
  item,
  viewMode,
  onOpen,
  onRename,
  onDownload,
  onDelete,
}: CustomFileCardProps) {
  if (viewMode === "list") {
    return (
      <div className="group flex items-center justify-between gap-3 rounded-2xl border border-border-glass bg-surface px-3 py-2.5 transition-all hover:border-border-glass-bright hover:bg-surface-elevated">
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900/40">
            {item.previewUrl && item.kind !== "folder" ? (
              <img
                src={item.previewUrl}
                alt={item.name}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              renderIcon(item)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-main">
              {item.name}
            </p>
            <p className="text-xs text-text-muted">
              {item.type === "directory"
                ? "Thư mục"
                : formatFileSize(item.size)}{" "}
              • {formatDate(item.createdAt)}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onRename(item)}
            className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-primary"
          >
            <Edit size={16} />
          </button>
          {item.type === "file" ? (
            <button
              type="button"
              onClick={() => onDownload(item)}
              className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-primary"
            >
              <Download size={16} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex cursor-pointer flex-col items-center gap-4 rounded-3xl border border-border-glass bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      <div className="absolute right-3 top-3 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        <div className="flex gap-1 rounded-xl border border-border-glass bg-white p-1.5 shadow-lg dark:bg-slate-900">
          <button
            type="button"
            onClick={() => onRename(item)}
            className="rounded-lg p-1.5 text-text-muted hover:text-primary"
          >
            <Edit size={14} />
          </button>
          {item.type === "file" ? (
            <button
              type="button"
              onClick={() => onDownload(item)}
              className="rounded-lg p-1.5 text-text-muted hover:text-primary"
            >
              <Download size={14} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="rounded-lg p-1.5 text-text-muted hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <button type="button" onClick={() => onOpen(item)} className="w-full">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900/40">
          {item.previewUrl && item.type === "file" ? (
            <>
              <img
                src={item.previewUrl}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {item.kind === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                  <PlayCircle className="h-12 w-12 text-white drop-shadow-xl" />
                </div>
              )}
            </>
          ) : (
            <div
              className={cn(
                "transition-transform duration-500 group-hover:scale-110",
              )}
            >
              {renderIcon(item)}
            </div>
          )}
        </div>

        <div className="w-full pt-4 text-center">
          <p className="truncate px-2 text-sm font-bold text-text-main">
            {item.name}
          </p>
          <p className="mt-1 text-[11px] font-medium text-text-muted">
            {item.type === "directory" ? "Thư mục" : formatFileSize(item.size)}{" "}
            • {formatDate(item.createdAt)}
          </p>
        </div>
      </button>
    </div>
  );
}
