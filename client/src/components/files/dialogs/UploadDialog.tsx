import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  FileVideo,
  Image as ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/src/lib/cn";
import { Button } from "@/src/components/ui/button";
import { CustomDialog } from "../../custom-ui";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

interface UploadingFile {
  id: string;
  name: string;
  size: string;
  status: "pending" | "done" | "error";
  type: "video" | "image" | "generic";
}

function getType(file: File): UploadingFile["type"] {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  return "generic";
}

function getIcon(type: UploadingFile["type"]) {
  if (type === "video") return <FileVideo size={18} className="text-primary" />;
  if (type === "image")
    return <ImageIcon size={18} className="text-tertiary" />;
  return <FileText size={18} className="text-slate-400" />;
}

function humanSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
}

export function UploadDialog({ isOpen, onClose, onUpload }: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMap, setStatusMap] = useState<
    Record<string, UploadingFile["status"]>
  >({});

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setStatusMap({});
      setSubmitting(false);
    }
  }, [isOpen]);

  const list = useMemo<UploadingFile[]>(() => {
    return selectedFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: humanSize(file.size),
      type: getType(file),
      status:
        statusMap[`${file.name}-${file.size}-${file.lastModified}`] ??
        "pending",
    }));
  }, [selectedFiles, statusMap]);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    setSelectedFiles((current) => [...current, ...incoming]);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || submitting) return;

    setSubmitting(true);
    const pendingMap: Record<string, UploadingFile["status"]> = {};
    selectedFiles.forEach((file) => {
      pendingMap[`${file.name}-${file.size}-${file.lastModified}`] = "pending";
    });
    setStatusMap(pendingMap);

    try {
      await onUpload(selectedFiles);
      const doneMap: Record<string, UploadingFile["status"]> = {};
      selectedFiles.forEach((file) => {
        doneMap[`${file.name}-${file.size}-${file.lastModified}`] = "done";
      });
      setStatusMap(doneMap);
    } catch {
      const errorMap: Record<string, UploadingFile["status"]> = {};
      selectedFiles.forEach((file) => {
        errorMap[`${file.name}-${file.size}-${file.lastModified}`] = "error";
      });
      setStatusMap(errorMap);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomDialog isOpen={isOpen} onClose={onClose} title="Tải tệp lên">
      <div className="flex flex-col gap-6 p-6">
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(125,211,252,0.1)]"
              : "border-sky-400/20 bg-slate-50 hover:border-primary/50 dark:bg-slate-900/20",
          )}
        >
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => addFiles(event.target.files)}
          />
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300",
              isDragging
                ? "scale-110 bg-primary text-slate-900"
                : "bg-primary/10 text-primary group-hover:scale-110",
            )}
          >
            <UploadCloud size={30} />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-main">
              Kéo thả tệp vào đây
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Hoặc nhấn để chọn tệp từ thiết bị của bạn
            </p>
          </div>
        </label>

        <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
          {list.length === 0 ? (
            <p className="rounded-xl border border-border-glass bg-surface px-4 py-3 text-sm text-text-muted">
              Chưa có tệp nào được chọn.
            </p>
          ) : (
            list.map((file) => (
              <div
                key={file.id}
                className="glass flex flex-col gap-3 rounded-xl border border-sky-400/10 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-slate-100 dark:bg-slate-900/10">
                      {getIcon(file.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-main">
                        {file.name}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                        {file.size} •{" "}
                        {file.status === "pending"
                          ? "ĐANG TẢI LÊN..."
                          : "HOÀN TẤT"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {file.status === "done" ? (
                      <CheckCircle2 className="text-green-500" size={20} />
                    ) : file.status === "error" ? (
                      <X className="text-red-400" size={20} />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        ...
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-auto rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-main"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>

                {file.status === "pending" ? (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/10">
                    <div
                      className="h-full rounded-full bg-primary shadow-[0_0_10px_#7dd3fc]"
                      style={{ width: "60%" }}
                    />
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="mt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            className="h-auto px-6 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-text-main"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            disabled={submitting || selectedFiles.length === 0}
            onClick={() => {
              void handleSubmit();
            }}
            variant="ghost"
            className="h-auto rounded-xl border border-primary/20 bg-primary/20 px-8 py-2.5 font-semibold text-primary shadow-[0_0_15px_rgba(125,211,252,0.1)] transition-all hover:bg-primary/30 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? "Đang tải..." : `Tải lên (${selectedFiles.length})`}
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
}
