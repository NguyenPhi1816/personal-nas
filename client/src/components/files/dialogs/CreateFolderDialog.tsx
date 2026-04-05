import { useEffect, useState } from "react";
import { FolderPlus, Info } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { CustomDialog } from "../../custom-ui";

interface CreateFolderDialogProps {
  isOpen: boolean;
  currentPathLabel: string;
  onClose: () => void;
  onCreate: (folderName: string) => Promise<void>;
}

export function CreateFolderDialog({
  isOpen,
  currentPathLabel,
  onClose,
  onCreate,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFolderName("");
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = folderName.trim();
    if (!value) return;

    setSubmitting(true);
    try {
      await onCreate(value);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomDialog isOpen={isOpen} onClose={onClose} title="Tạo thư mục mới">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 shadow-[0_0_20px_rgba(125,211,252,0.2)]">
            <FolderPlus size={32} className="text-primary" />
          </div>
          <p className="text-sm text-text-muted">
            Đặt tên cho không gian lưu trữ của bạn
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="folderName"
            className="ml-1 text-[10px] font-bold uppercase tracking-widest text-text-muted"
          >
            Tên thư mục
          </label>
          <Input
            id="folderName"
            autoFocus
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Dự án mùa đông 2024"
            className="h-auto rounded-xl border-sky-400/10 bg-white px-4 py-3 text-text-main shadow-sm placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-primary/50 dark:bg-slate-900/10"
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3">
          <Info size={16} className="shrink-0 text-primary" />
          <p className="text-[11px] text-text-muted">
            Thư mục sẽ được tạo trong{" "}
            <span className="font-semibold text-primary">
              {currentPathLabel}
            </span>
          </p>
        </div>

        <div className="mt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            className="h-auto px-6 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-text-main"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={submitting || !folderName.trim()}
            variant="ghost"
            className="h-auto rounded-xl border border-primary/20 bg-primary/20 px-8 py-2.5 font-semibold text-primary shadow-[0_0_15px_rgba(125,211,252,0.1)] transition-all hover:bg-primary/30 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? "Đang tạo..." : "Tạo mới"}
          </Button>
        </div>
      </form>
    </CustomDialog>
  );
}
