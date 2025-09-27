import { body, param } from "express-validator";
import mongoose from "mongoose";
import createHttpError from "http-errors";

export const recipeValidators = {
    create: [
        body("title").trim().isLength({ min: 1, max: 100 }).escape(),
        body("description").optional().trim().isLength({ max: 500 }).escape(),
        body("instructions").isArray({ min: 1 }),
        body("instructions.*").trim().isLength({ min: 1 }).escape(),
        body("ingredients").isArray({ min: 1 }),
        body("ingredients.*.quantity").isFloat({ min: 0 }),
        body("ingredients.*.unit").trim().isLength({ min: 1 }),
        body("ingredients.*.name").trim().isLength({ min: 1 }).escape(),
        body("ingredients.*.notes").optional().trim().escape(),
        body("brewMethod").optional().isIn(["espresso", "pour-over", "french-press", "aero-press", "cold-brew", "moka-pot", "other"]),
        body("brewTime").optional().isInt({ min: 0 }),
        body("difficulty").optional().isIn(["beginner", "intermediate", "expert"]),
    ],
    update: [
        param("id").custom(value => {
            if (!mongoose.isValidObjectId(value)) {
                throw createHttpError(400, "Invalid recipe ID");
            }

            return true;
        }),
        body("title").optional().trim().isLength({ min: 1, max: 100 }).escape(),
        body("description").optional().trim().isLength({ max: 500 }).escape(),
        body("instructions").optional().isArray({ min: 1 }),
        body("instructions.*").optional().trim().isLength({ min: 1 }).escape(),
        body("ingredients").optional().isArray({ min: 1 }),
        body("ingredients.*.quantity").optional().isFloat({ min: 0 }),
        body("ingredients.*.unit").optional().trim().isLength({ min: 1 }),
        body("ingredients.*.name").optional().trim().isLength({ min: 1 }).escape(),
        body("ingredients.*.notes").optional().trim().escape(),
        body("brewMethod").optional().isIn(["espresso", "pour-over", "french-press", "aero-press", "cold-brew", "moka-pot", "other"]),
        body("brewTime").optional().isInt({ min: 0 }),
        body("difficulty").optional().isIn(["beginner", "intermediate", "expert"]),
    ],
    idParam: [
        param("id").custom(value => {
            if (!mongoose.isValidObjectId(value)) {
                throw createHttpError(400, "Invalid recipe ID");
            }

            return true;
        }),
    ],
};

export const userValidators = {
    signUp: [
        body("username").trim().isLength({ min: 3, max: 30 }).isAlphanumeric().withMessage("Username must be alphanumeric"),
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    ],
    login: [
        body("username").trim().isLength({ min: 1 }),
        body("password").isLength({ min: 1 }),
    ],
};

export const reviewValidators = {
    create: [
        body("comment").trim().isLength({ min: 1, max: 500 }).escape(),
        body("rating").isInt({ min: 1, max: 5 }),
    ],
    idParam: [
        param("id").custom(value => {
            if (!mongoose.isValidObjectId(value)) {
                throw createHttpError(400, "Invalid recipe ID");
            }

            return true;
        }),
    ],
};
