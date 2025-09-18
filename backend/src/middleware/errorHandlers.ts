import type { RequestHandler, Request, Response, NextFunction } from "express";
import createHttpError, { isHttpError } from "http-errors";

export const handleUnfoundEndpoint: RequestHandler = (request, response, next) => {
    next(createHttpError(404, "Endpoint not found"));
};

export const handleHttpErrors = (error: unknown, request: Request, response: Response, next: NextFunction) => {
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;

    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }

    response.status(statusCode).json({ error: errorMessage });
    console.error(error);
};
