import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { extractBearerToken, extractQueryToken } from "./token.utils";

@Injectable()
export class RequireAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    let token = extractBearerToken(authHeader);
    if (!token) {
      token = extractQueryToken(req.query?.token);
    }

    if (!token) throw new UnauthorizedException("Missing token");

    const payload = this.authService.verify(token);
    req.user = payload;
    return true;
  }
}
