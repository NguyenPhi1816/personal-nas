export function extractBearerToken(headerValue: unknown): string | null {
  if (!headerValue || typeof headerValue !== "string") return null;

  const parts = headerValue.trim().split(" ");
  if (parts.length !== 2) return null;

  const [scheme, token] = parts;
  if (scheme.toLowerCase() !== "bearer" || !token) return null;

  return token;
}

export function extractQueryToken(tokenValue: unknown): string | null {
  if (typeof tokenValue === "string" && tokenValue.trim().length > 0) {
    return tokenValue.trim();
  }

  if (Array.isArray(tokenValue) && tokenValue.length > 0) {
    const candidate = tokenValue[0];
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}
