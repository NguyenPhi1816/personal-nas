import * as os from "os";
import * as path from "path";

function readTextEnv(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readNumberEnv(key: string, fallback: number): number {
  const value = readTextEnv(key);
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  return parsed;
}

export function getPort(): number {
  return readNumberEnv("PORT", 3000);
}

export function getRateLimitMax(): number {
  return readNumberEnv("RATE_LIMIT_MAX", 100);
}

export function getJwtSecret(): string {
  return readTextEnv("JWT_SECRET") ?? "dev-secret";
}

export function getNasRootDir(): string {
  return readTextEnv("NAS_ROOT_DIR") ?? path.join(process.cwd(), "nas-storage");
}

export function getUploadTmpDir(): string {
  return (
    readTextEnv("UPLOAD_TMP_DIR") ??
    path.join(os.tmpdir(), "personal-nas", "uploads")
  );
}

export function getThumbCacheDir(): string {
  return (
    readTextEnv("THUMB_CACHE_DIR") ?? path.join(getNasRootDir(), ".thumb_cache")
  );
}

export function getCorsOrigins(): string[] | true {
  const value = readTextEnv("CORS_ORIGIN");
  if (!value || value === "*") return true;
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
