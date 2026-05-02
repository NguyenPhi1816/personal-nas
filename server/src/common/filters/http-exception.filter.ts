import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = "Internal server error";
    let errors: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resObj: any = exception.getResponse();
      if (typeof resObj === "string") {
        message = resObj;
      } else {
        message = resObj.message || resObj;
        errors = resObj.errors;
      }
    } else if (exception && exception.message) {
      message = exception.message;
    }

    const body: Record<string, unknown> = {
      status: "error",
      code: status,
      message,
    };

    if (errors !== undefined) {
      body.errors = errors;
    }

    res.status(status).json(body);
  }
}
