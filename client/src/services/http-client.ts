import axios from "axios";
import { env } from "@/src/lib/env";
import { getToken } from "@/src/lib/token-storage";

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
});

httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (!token) return config;

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

