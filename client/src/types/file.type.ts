export interface FileItem {
  name: string;
  type: "file" | "directory";
  size: number;
  createdAt: string;
  path: string;
}

export type PreviewType = "image" | "video" | "raw";

export type FileViewMode = "grid" | "list";

export type FileKind =
  | "folder"
  | "image"
  | "video"
  | "pdf"
  | "doc"
  | "spreadsheet"
  | "raw"
  | "generic";

export interface FileEntry {
  id: string;
  name: string;
  path: string;
  type: FileItem["type"];
  size: number;
  createdAt: string;
  kind: FileKind;
  previewUrl?: string;
}
