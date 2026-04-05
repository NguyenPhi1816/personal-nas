import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "./jwt.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginDto) {
    const { username, password } = body;
    const validUser = username === "admin" && password === "admin123";

    if (!validUser) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.authService.sign({
      sub: username,
      username,
      role: "admin",
    });

    return {
      token,
      user: { username, role: "admin" },
    };
  }

  @Get("check")
  @UseGuards(JwtAuthGuard)
  check(@Req() req: Request) {
    return { user: (req as any).user || null };
  }

  @Post("logout")
  logout() {
    // JWT tokens are stateless, logout is handled client-side
    return { success: true };
  }
}
