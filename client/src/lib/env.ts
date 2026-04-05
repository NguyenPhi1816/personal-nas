const DEFAULT_APP_NAME = "Personal NAS";
const DEFAULT_API_BASE_URL = "/api";
const DEFAULT_API_PROXY_TARGET = "http://localhost:3000/api";
const DEFAULT_THUMBNAIL_WIDTH = 200;

function getEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function getEnvNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  appName: getEnv("NEXT_PUBLIC_APP_NAME", DEFAULT_APP_NAME),
  apiBaseUrl: getEnv("NEXT_PUBLIC_API_BASE_URL", DEFAULT_API_BASE_URL),
  apiProxyTarget: getEnv("API_PROXY_TARGET", DEFAULT_API_PROXY_TARGET),
  defaultThumbnailWidth: getEnvNumber(
    "NEXT_PUBLIC_DEFAULT_THUMBNAIL_WIDTH",
    DEFAULT_THUMBNAIL_WIDTH,
  ),
};
