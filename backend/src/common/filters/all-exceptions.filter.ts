import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessRuleViolationException } from '../exceptions/business-rule-violation.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BusinessRuleViolationException) {
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message,
        error: 'Business Rule Violation',
        details: exception.details,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        response.status(status).json(exceptionResponse);
      } else {
        response.status(status).json({
          statusCode: status,
          message: exceptionResponse,
        });
      }
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    response.status(500).json({
      statusCode: 500,
      message,
      error: 'Internal Server Error',
    });
  }
}
