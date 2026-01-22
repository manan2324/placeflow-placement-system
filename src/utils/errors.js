export class AppError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, code?: string }} [options]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = "AppError";
    this.status = options.status ?? 500;
    this.code = options.code ?? "SERVER_ERROR";
  }
}

export function badRequest(message, code = "BAD_REQUEST") {
  return new AppError(message, { status: 400, code });
}

export function unauthorized(message = "Authentication required", code = "UNAUTHORIZED") {
  return new AppError(message, { status: 401, code });
}

export function forbidden(message = "Access denied", code = "FORBIDDEN") {
  return new AppError(message, { status: 403, code });
}

export function notFound(message = "Not found", code = "NOT_FOUND") {
  return new AppError(message, { status: 404, code });
}

export function conflict(message = "Conflict", code = "CONFLICT") {
  return new AppError(message, { status: 409, code });
}
