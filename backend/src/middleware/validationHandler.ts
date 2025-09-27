import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export const handleValidationErrors = (request: Request, response: Response, next: NextFunction) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === "field" ? error.path : "unknown",
            message: error.msg,
        }));

        throw createHttpError(400, "Validation failed", {
            details: errorMessages,
        });
    }

    next();
};
