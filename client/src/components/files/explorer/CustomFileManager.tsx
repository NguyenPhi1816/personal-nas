"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, LayoutGrid, List, Plus } from "lucide-react";
import { fileApi } from "@/src/services/file-api";
import { buildBreadcrumbs, toFileEntry } from "../file-entry";
import { CreateFolderDialog } from "../dialogs/CreateFolderDialog";
import { CustomFileCard } from "./CustomFileCard";
import { CustomSidebar } from "./CustomSidebar";
import { CustomTopBar } from "./CustomTopBar";
import ImagePreviewDialog from "../dialogs/ImagePreviewDialog";
import { UploadDialog } from "../dialogs/UploadDialog";
import VideoPreviewDialog from "../dialogs/VideoPreviewDialog";
import type {
  FileEntry,
  FileViewMode,
  PreviewType,
} from "@/src/types/file.type";
import { detectPreviewType, normalizeUiPath } from "@/src/lib/path";
import { useThemeMode } from "@/src/hooks/useThemeMode";
import { cn } from "@/src/lib/cn";

interface CustomFileManagerProps {
  userName?: string;
  onLogout: () => void;
}

function useFolderEntries(path: string) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const list = await fileApi.list(path);
      setEntries(list.map(toFileEntry));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải danh sách tệp";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  return {
    entries,
    loading,
    errorMessage,
    setErrorMessage,
    refresh,
  };
}

export default function CustomFileManager({
  userName,
  onLogout,
}: CustomFileManagerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [viewMode, setViewMode] = useState<FileViewMode>("grid");
  const [searchValue, setSearchValue] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    filePath: string;
    fileType: PreviewType;
  } | null>(null);

  const { theme, toggleTheme } = useThemeMode();

  const { entries, loading, errorMessage, setErrorMessage, refresh } =
    useFolderEntries(currentPath);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(currentPath),
    [currentPath],
  );

  const filteredEntries = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return entries;

    return entries.filter((entry) =>
      entry.name.toLowerCase().includes(keyword),
    );
  }, [entries, searchValue]);

  const navigate = useCallback((path: string) => {
    setCurrentPath(normalizeUiPath(path));
    setSidebarOpen(false);
  }, []);

  const handleOpenEntry = useCallback(
    (entry: FileEntry) => {
      if (entry.type === "directory") {
        navigate(entry.path);
        return;
      }

      const previewType = detectPreviewType(entry.path);
      if (previewType) {
        setPreviewFile({ filePath: entry.path, fileType: previewType });
        return;
      }

      fileApi.download(entry.path);
    },
    [navigate],
  );

  const handleCreateFolder = useCallback(
    async (folderName: string) => {
      try {
        await fileApi.createFolder(currentPath, folderName);
        await refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Tạo thư mục thất bại",
        );
      }
    },
    [currentPath, refresh, setErrorMessage],
  );

  const handleUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      try {
        await Promise.all(
          files.map((file) => fileApi.upload(file, currentPath)),
        );
        await refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Tải tệp thất bại",
        );
      }
    },
    [currentPath, refresh, setErrorMessage],
  );

  const handleDelete = useCallback(
    async (entry: FileEntry) => {
      const confirmed = window.confirm(`Xóa ${entry.name}?`);
      if (!confirmed) return;

      try {
        await fileApi.delete(entry.path);
        await refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Xóa thất bại",
        );
      }
    },
    [refresh, setErrorMessage],
  );

  const handleRename = useCallback(
    async (entry: FileEntry) => {
      const newName = window.prompt("Tên mới", entry.name);
      if (!newName || newName.trim() === "" || newName.trim() === entry.name) {
        return;
      }

      try {
        await fileApi.rename(entry.path, newName.trim());
        await refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Đổi tên thất bại",
        );
      }
    },
    [refresh, setErrorMessage],
  );

  const handleDownload = useCallback((entry: FileEntry) => {
    if (entry.type === "file") {
      fileApi.download(entry.path);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-text-main">
      <CustomTopBar
        toggleSidebar={() => setSidebarOpen((value) => !value)}
        onUploadClick={() => setIsUploadOpen(true)}
        onCreateFolderClick={() => setIsCreateFolderOpen(true)}
        isDark={theme === "dark"}
        toggleTheme={toggleTheme}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-125 w-125 rounded-full bg-primary/5 blur-[120px] z-50" />
        <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-100 w-100 rounded-full bg-tertiary/5 blur-[120px] z-50" />

        <CustomSidebar
          isOpen={sidebarOpen}
          currentPath={currentPath}
          onNavigateRoot={() => navigate("/")}
          onClose={() => setSidebarOpen(false)}
          onLogout={onLogout}
        />

        <main className="relative max-h-[calc(100vh-64px)] z-10 flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="z-10 flex items-center justify-between px-4 pt-6 pb-2 md:px-8">
            <div className="flex items-center gap-2 text-sm font-medium">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={crumb.path} className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => navigate(crumb.path)}
                      className={cn(
                        "transition-colors",
                        isLast
                          ? "font-bold text-text-main"
                          : "cursor-pointer text-text-muted hover:text-primary",
                      )}
                    >
                      {crumb.label}
                    </button>
                    {!isLast ? (
                      <ChevronRight size={14} className="text-slate-300" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-border-glass bg-slate-100 p-1 dark:bg-slate-900/50">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-lg p-2 transition-all",
                  viewMode === "grid"
                    ? "bg-white text-primary shadow-sm dark:bg-primary dark:text-white"
                    : "text-text-muted hover:text-primary",
                )}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-lg p-2 transition-all",
                  viewMode === "list"
                    ? "bg-white text-primary shadow-sm dark:bg-primary dark:text-white"
                    : "text-text-muted hover:text-primary",
                )}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className="z-10 flex-1 overflow-y-auto px-4 pt-4 pb-24 md:px-8">
            {errorMessage ? (
              <div className="mb-4 rounded-xl border border-red-300/40 bg-red-100/40 px-4 py-3 text-sm text-red-700 dark:bg-red-500/12 dark:text-red-200">
                {errorMessage}
              </div>
            ) : null}

            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-3xl border border-border-glass bg-surface"
                  />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="rounded-2xl border border-border-glass bg-surface p-8 text-center">
                <p className="text-base font-semibold text-text-main">
                  Không có dữ liệu
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {searchValue
                    ? "Không tìm thấy tệp phù hợp từ khóa."
                    : "Thư mục hiện tại chưa có tệp hoặc thư mục con."}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"
                    : "space-y-2"
                }
              >
                {filteredEntries.map((entry) => (
                  <CustomFileCard
                    key={entry.id}
                    item={entry}
                    viewMode={viewMode}
                    onOpen={handleOpenEntry}
                    onRename={(target) => {
                      void handleRename(target);
                    }}
                    onDownload={handleDownload}
                    onDelete={(target) => {
                      void handleDelete(target);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={() => setIsUploadOpen(true)}
        className="fixed bottom-7 right-7 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/35 transition-transform active:scale-95 md:hidden"
      >
        <Plus size={24} />
      </button>

      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={async (files) => {
          await handleUpload(files);
        }}
      />

      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        currentPathLabel={
          breadcrumbs[breadcrumbs.length - 1]?.label ?? "My Cloud"
        }
      />

      {previewFile?.fileType === "video" ? (
        <VideoPreviewDialog
          filePath={previewFile.filePath}
          onClose={() => setPreviewFile(null)}
        />
      ) : previewFile ? (
        <ImagePreviewDialog
          filePath={previewFile.filePath}
          fileType={previewFile.fileType === "raw" ? "raw" : "image"}
          onClose={() => setPreviewFile(null)}
        />
      ) : null}
    </div>
  );
}
