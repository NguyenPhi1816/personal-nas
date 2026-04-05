import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface CustomDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

function CustomDialog({
  isOpen,
  title,
  onClose,
  className,
  children,
}: CustomDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden rounded-2xl border ring-0 border-border-glass-bright bg-surface-elevated p-0 text-text-main shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-border-glass px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-primary">
            <p className="max-w-50 truncate">{title}</p>
          </DialogTitle>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-main"
            aria-label="Close"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="max-h-screen sm:max-h-[80vh] max-w-screen sm:max-w-[80vw] overflow-y-auto flex items-center justify-center">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CustomDialog;
