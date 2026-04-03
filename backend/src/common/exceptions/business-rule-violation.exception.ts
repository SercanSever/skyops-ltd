export class BusinessRuleViolationException extends Error {
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 422,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'BusinessRuleViolationException';
    this.statusCode = statusCode;
    this.details = details;
  }
}
