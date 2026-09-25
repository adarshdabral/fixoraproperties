import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
    });
  }

  // body-parser rejects malformed JSON / oversized bodies with an http-errors object (status 400/413) — a client mistake, not a crash.
  if (err && typeof err === "object" && "type" in err && typeof (err as { status?: unknown }).status === "number") {
    const { status, type } = err as { status: number; type: string };
    if (status >= 400 && status < 500) {
      return res.status(status).json({
        success: false,
        error:
          type === "entity.too.large"
            ? { code: "PAYLOAD_TOO_LARGE", message: "Request body is too large" }
            : { code: "BAD_REQUEST", message: "Malformed request body" },
      });
    }
  }

  // A malformed id (e.g. /properties/not-an-id) can't match any document — treat it as not found, not a crash.
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Resource not found" },
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid input", details: err.message },
    });
  }

  if (err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: "DUPLICATE", message: "A record with these details already exists" },
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, err.message);
    }
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
  }

  logger.error({ err, path: req.path }, "Unhandled error");
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
      ...(env.NODE_ENV !== "production" && err instanceof Error ? { details: err.stack } : {}),
    },
  });
}
