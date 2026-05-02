import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./jwt.guard";
import { RequireAuthGuard } from "./require-auth.guard";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [AuthService, JwtAuthGuard, RequireAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, RequireAuthGuard],
})
export class AuthModule {}
