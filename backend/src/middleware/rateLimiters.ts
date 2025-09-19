import type { RequestHandler } from "express";
import { authRateLimit, apiRateLimit } from "../config/upstash.js";
import assertIsDefined from "../util/assertIsDefined.js";
import createHttpError from "http-errors";

export const authRateLimiter: RequestHandler = async (request, response, next) => {
    const userIp = request.ip;

    try {
        assertIsDefined(userIp);

        const { success } = await authRateLimit.limit(userIp);

        if (!success) {
            throw createHttpError(429, "Too many authentication requests");
        }

        next();
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const apiRateLimiter: RequestHandler = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const userIp = request.ip;

    try {
        let success;

        if (authenticatedUserId) {
            success = (await apiRateLimit.limit(authenticatedUserId.toString())).success;
        } else if (userIp) {
            success = (await apiRateLimit.limit(userIp)).success;
        } else {
            throw createHttpError(500, "Error obtaining IP address");
        }

        if (!success) {
            throw createHttpError(429, "Too many API requests");
        }

        next();
    } catch (error) {
        console.error(error);
        next(error);
    }
};
