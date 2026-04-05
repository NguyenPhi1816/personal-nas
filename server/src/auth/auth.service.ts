import { Injectable, UnauthorizedException } from "@nestjs/common";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../common/config/app-config";

export interface JwtUserPayload {
  sub: string;
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly secret = getJwtSecret();

  verify(token: string): JwtUserPayload {
    try {
      return jwt.verify(token, this.secret) as JwtUserPayload;
    } catch (e) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  sign(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.secret, { expiresIn: "1h" });
  }
}
