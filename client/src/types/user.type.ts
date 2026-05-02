export interface User {
  id?: string;
  sub?: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
