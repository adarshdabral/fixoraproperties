import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type Source = "body" | "query" | "params";

/**
 * Validates and replaces req[source] with the parsed (and coerced/defaulted)
 * data. Throwing ZodError is handled centrally by errorHandler.
 */
export function validate(schema: ZodTypeAny, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);
    (req as unknown as Record<Source, unknown>)[source] = parsed;
    next();
  };
}
