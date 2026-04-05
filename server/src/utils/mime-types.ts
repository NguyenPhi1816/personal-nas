/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    svg: "image/svg+xml",

    // RAW images
    raw: "image/x-raw",
    arw: "image/x-sony-arw",
    cr2: "image/x-canon-cr2",
    nef: "image/x-nikon-nef",
    dng: "image/x-adobe-dng",
    raf: "image/x-fuji-raf",
    orf: "image/x-olympus-orf",

    // Videos
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",

    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",

    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",

    // Text
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}
