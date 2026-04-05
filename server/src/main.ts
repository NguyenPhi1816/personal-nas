import "dotenv/config";
import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import {
  getCorsOrigins,
  getPort,
  getRateLimitMax,
} from "./common/config/app-config";
import rateLimit from "express-rate-limit";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  });

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: getRateLimitMax(),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      const r: any = req;
      // Skip image routes so a separate, more generous limiter can be applied
      return typeof r.path === "string" && r.path.startsWith("/api/images");
    },
  });
  app.use(globalLimiter);

  const imagesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    // Allow a higher limit for thumbnails (per-token when available)
    max: Math.max(getRateLimitMax() * 10, 500),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const r: any = req;
      if (r.query && r.query.token) return String(r.query.token);
      const auth =
        r.headers && (r.headers.authorization || r.headers["x-access-token"]);
      if (auth) return String(auth);
      return r.ip;
    },
  });
  app.use("/api/images", imagesLimiter);

  const port = getPort();
  await app.listen(port);
  Logger.log(`Server running on port ${port}`, "Bootstrap");
}
bootstrap();
