import type { RequestHandler } from "express";
import createHttpError from "http-errors";

const requiresAuth: RequestHandler = (request, response, next) => {
    if (request.session.userId) {
        next();
    } else {
        next(createHttpError(401, "User not authenticated"));
    }
};

export default requiresAuth;
