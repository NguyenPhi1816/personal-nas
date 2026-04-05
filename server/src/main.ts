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

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: getRateLimitMax(),
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  const port = getPort();
  await app.listen(port);
  Logger.log(`Server running on port ${port}`, "Bootstrap");
}
bootstrap();
