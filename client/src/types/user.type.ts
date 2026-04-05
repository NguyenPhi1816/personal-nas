export interface User {
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
