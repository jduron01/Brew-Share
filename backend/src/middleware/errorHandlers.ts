import type { RequestHandler, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import createHttpError, { isHttpError } from "http-errors";
import env from "../util/validateEnvVars.js";

export const handleUnfoundEndpoint: RequestHandler = (request, response, next) => {
    next(createHttpError(404, "Endpoint not found"));
};

export const handleHttpErrors = (error: unknown, request: Request, response: Response, next: NextFunction) => {
    const isProduction = env.NODE_ENV === "production";

    if (isHttpError(error)) {
        response.status(error.status).json({
            error: error.message,
            ...(!isProduction && { details: error }),
        });
    } else if (error instanceof mongoose.Error.ValidationError) {
        response.status(400).json({
            error: "Validation failed",
            ...(!isProduction && { details: error.errors }),
        });
    } else {
        response.status(500).json({
            error: isProduction ? "Internal server error" : (error as Error).message,
        });
    }

    console.error(error);
};
