import { httpClient } from "@/src/services/http-client";
import type { LoginResponse, User } from "@/src/types/user.type";

export async function loginRequest(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
  return data;
}

export async function checkAuthRequest(token: string): Promise<User | null> {
  const { data } = await httpClient.get<{ user: User | null }>("/auth/check", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.user ?? null;
}
