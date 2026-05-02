import axios from "axios";

type ApiErrorItem = {
  field?: string;
  message?: string;
};

type ApiErrorResponse = {
  message?: unknown;
  errors?: unknown;
};

function formatMessage(value: unknown): string | null {
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
    return parts.length > 0 ? parts.join(" ") : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

function formatErrors(value: unknown): string | null {
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }

        if (item && typeof item === "object") {
          const candidate = item as ApiErrorItem;
          const message = candidate.message?.trim();
          if (!message) {
            return "";
          }

          const field = candidate.field?.trim();
          return field ? `${field}: ${message}` : message;
        }

        return "";
      })
      .filter((item) => item.length > 0);

    return parts.length > 0 ? parts.join(" ") : null;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const parts = entries.flatMap(([field, messages]) => {
      if (Array.isArray(messages)) {
        return messages
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter((item) => item.length > 0)
          .map((message) => `${field}: ${message}`);
      }

      if (typeof messages === "string") {
        const message = messages.trim();
        return message.length > 0 ? [`${field}: ${message}`] : [];
      }

      return [];
    });

    return parts.length > 0 ? parts.join(" ") : null;
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorResponse | undefined;
    const structuredErrors = formatErrors(payload?.errors);
    if (structuredErrors) {
      return structuredErrors;
    }

    const responseMessage = formatMessage(payload?.message);
    if (responseMessage) {
      return responseMessage;
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.length > 0) {
      return message;
    }
  }

  return fallbackMessage;
}
