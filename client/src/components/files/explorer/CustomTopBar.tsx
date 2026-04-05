import { FolderPlus, Menu, Moon, Search, Sun, UploadCloud } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface CustomTopBarProps {
  toggleSidebar: () => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function CustomTopBar({
  toggleSidebar,
  onUploadClick,
  onCreateFolderClick,
  isDark,
  toggleTheme,
  searchValue,
  onSearchChange,
}: CustomTopBarProps) {
  return (
    <header className="h-16 sticky top-0 z-10 flex w-full items-center justify-between border-b border-border-glass bg-surface px-4 py-3 transition-colors duration-300 md:px-8">
      <div className="flex-1 flex items-center gap-2 md:gap-12">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-slate-100 dark:hover:bg-white/5 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="flex cursor-pointer items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-primary">
            Glacier NAS
          </h1>
        </div>
      </div>

      <div className="hidden flex-1 max-w-xl px-4 md:block">
        <div className="group relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
            size={18}
          />
          <Input
            className="h-auto w-full rounded-full border-border-glass bg-white py-2.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-primary/20 dark:bg-slate-900/50 dark:text-text-main"
            placeholder="Search files..."
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
        <Button
          onClick={onUploadClick}
          variant="default"
          className="h-auto rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
        >
          <UploadCloud size={18} />
          <span className="hidden sm:inline">Tải lên</span>
        </Button>

        <Button
          onClick={onCreateFolderClick}
          variant="ghost"
          size="icon"
          className="hidden rounded-xl text-text-muted transition-all hover:bg-slate-100 hover:text-primary active:scale-95 dark:hover:bg-sky-400/10 sm:inline-flex"
          title="Tạo thư mục"
        >
          <FolderPlus size={20} />
        </Button>

        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="icon"
          className="rounded-xl text-text-muted transition-all hover:bg-slate-100 hover:text-primary active:scale-95 dark:hover:bg-sky-400/10"
          title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        <Avatar className="h-10 w-10 cursor-pointer border-2 border-slate-100 transition-colors hover:border-primary dark:border-primary/20">
          <AvatarImage
            alt="User avatar"
            src="https://picsum.photos/seed/user/100/100"
            referrerPolicy="no-referrer"
          />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
