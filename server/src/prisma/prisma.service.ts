import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly enabled: boolean;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    super({
      adapter: new PrismaPg({
        connectionString:
          databaseUrl || "postgresql://invalid:invalid@localhost:5432/invalid",
      }),
    });

    this.enabled = Boolean(databaseUrl);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) return;
    await this.$connect();
    await this.ensureUserNameColumns();
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.enabled) return;
    await this.$disconnect();
  }

  private async ensureUserNameColumns(): Promise<void> {
    await this.$executeRawUnsafe(
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT',
    );
    await this.$executeRawUnsafe(
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT',
    );
  }
}
