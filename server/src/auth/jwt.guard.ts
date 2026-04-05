import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { extractBearerToken } from "./token.utils";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) return true;

    const token = extractBearerToken(authHeader);
    if (!token) throw new UnauthorizedException("Bad auth header");

    const payload = this.authService.verify(token);
    req.user = payload;
    return true;
  }
}
