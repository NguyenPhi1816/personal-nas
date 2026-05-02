import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "./jwt.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.authService.register(
      body.username,
      body.password,
      body.firstName,
      body.lastName,
    );
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
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
