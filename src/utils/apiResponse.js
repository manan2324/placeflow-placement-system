import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import mongoose from "mongoose";

export function json(data, { status = 200, headers } = {}) {
  return NextResponse.json(data, { status, headers });
}

export function successResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data
  };
}

export function errorResponse(message, { status = 500, errorCode = "SERVER_ERROR" } = {}) {
  return NextResponse.json(
    {
      success: false,
      message,
      errorCode,
      code: errorCode,
    },
    { status }
  );
}

export function fromError(err) {
  if (err instanceof AppError) {
    return errorResponse(err.message, { status: err.status, errorCode: err.code });
  }

  // Duplicate key (e.g., unique index violation). Don't leak DB details.
  if (err?.code === 11000) {
    return errorResponse("Duplicate resource", { status: 409, errorCode: "DUPLICATE_KEY" });
  }

  if (err instanceof mongoose.Error.CastError) {
    return errorResponse("Invalid identifier", { status: 400, errorCode: "BAD_ID" });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return errorResponse("Invalid input", { status: 400, errorCode: "VALIDATION_ERROR" });
  }

  if (err instanceof ZodError) {
    const first = err.issues?.[0];
    const path = first?.path?.length ? `${first.path.join(".")}: ` : "";
    const message = `${path}${first?.message ?? "Invalid input"}`;
    return errorResponse(message, { status: 400, errorCode: "VALIDATION_ERROR" });
  }

  if (err instanceof SyntaxError) {
    return errorResponse("Invalid JSON body", { status: 400, errorCode: "INVALID_JSON" });
  }

  // Log errors in development only
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  return errorResponse("Server error", { status: 500, errorCode: "SERVER_ERROR" });
}

export function withErrorHandling(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return fromError(err);
    }
  };
}
