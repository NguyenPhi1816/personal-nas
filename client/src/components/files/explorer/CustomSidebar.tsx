import {
  ChevronDown,
  ChevronRight,
  Cloud,
  Folder,
  FolderOpen,
  HelpCircle,
  Image,
  LogOut,
  Settings,
  Star,
  Trash2,
  Video,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/src/lib/cn";

interface CustomSidebarProps {
  isOpen: boolean;
  currentPath: string;
  onNavigateRoot: () => void;
  onClose: () => void;
  onLogout: () => void;
}

export function CustomSidebar({
  isOpen,
  currentPath,
  onNavigateRoot,
  onClose,
  onLogout,
}: CustomSidebarProps) {
  const segments = currentPath.split("/").filter(Boolean);

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-11 bg-black/40 backdrop-blur-sm md:hidden"
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-72 flex-col gap-2 border-r border-border-glass bg-surface p-4 transition-transform duration-300 md:relative md:w-64 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={onNavigateRoot}
          className="mb-2 flex items-center gap-3 px-2 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Cloud className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold leading-none text-text-main">
              Storage
            </h3>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-text-muted">
              1.2TB of 2TB used
            </p>
          </div>
        </button>

        <nav className="scrollbar-hide flex flex-1 flex-col gap-1 overflow-y-auto">
          <SidebarLink
            label="Tất cả tệp tin"
            icon={<Folder size={18} />}
            active={currentPath === "/"}
            onClick={onNavigateRoot}
          />
          <SidebarLink label="Yêu thích" icon={<Star size={18} />} />
          <SidebarLink label="Photos" icon={<Image size={18} />} />
          <SidebarLink label="Videos" icon={<Video size={18} />} />
          <SidebarLink label="Trash" icon={<Trash2 size={18} />} />
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-border-glass pt-4">
          <SidebarLink label="Settings" icon={<Settings size={18} />} />
          <SidebarLink label="Support" icon={<HelpCircle size={18} />} />
          <SidebarLink
            label="Logout"
            icon={<LogOut size={18} />}
            onClick={onLogout}
          />
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200",
        active
          ? "bg-sky-50 font-bold text-primary dark:bg-primary/15"
          : "text-text-muted hover:bg-slate-50 hover:text-primary dark:hover:bg-slate-800/10",
      )}
    >
      <span className="transition-transform group-hover:scale-110">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
