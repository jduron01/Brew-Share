import type { RequestHandler } from "express";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import User from "../models/user.js";
import Recipe from "../models/recipe.js";

export const getAuthenticatedUser: RequestHandler = async (request, response, next) => {
    try {
        const user = await User.findById(request.session.userId).select("+email").exec();
        response.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

interface GetUserRecipesParams {
    username: string,
};

export const getUserRecipes: RequestHandler<GetUserRecipesParams, unknown, unknown, unknown> = async (request, response, next) => {
    try {
        const user = await User.findOne({ username: request.params.username }).exec();

        if (!user) {
            throw createHttpError(404, "User not found");
        }

        const userRecipes = [];

        for (const recipeId of user.recipes) {
            const recipe = await Recipe.findById(recipeId).exec();

            if (!recipe) {
                throw createHttpError(500, "Error finding user recipes");
            }

            userRecipes.push(recipe);
        }

        response.status(200).json(userRecipes);
    } catch (error) {
        next(error);
    }
};

interface SignUpBody {
    username: string,
    email: string,
    password: string,
};

export const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (request, response, next) => {
    const { username, email, password } = request.body;

    try {
        if (!username) {
            throw createHttpError(400, "Username is missing");
        }

        if (!email) {
            throw createHttpError(400, "Email is missing");
        }

        if (!password) {
            throw createHttpError(400, "Password is missing");
        }

        const existingUsername = await User.findOne({ username }).exec();

        if (existingUsername) {
            throw createHttpError(409, "Username already taken");
        }

        const existingEmail = await User.findOne({ email }).exec();

        if (existingEmail) {
            throw createHttpError(409, "Email already taken");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        request.session.userId = user._id;

        response.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

interface LogInBody {
    username: string,
    password: string,
};

export const logIn: RequestHandler<unknown, unknown, LogInBody, unknown> = async (request, response, next) => {
    const { username, password } = request.body;

    try {
        if (!username) {
            throw createHttpError(400, "Username is missing");
        }

        if (!password) {
            throw createHttpError(400, "Password is missing");
        }

        const user = await User.findOne({ username }).select("+password +email").exec();

        if (!user) {
            throw createHttpError(401, "Email or password is incorrect");
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            throw createHttpError(401, "Email or password is incorrect");
        }

        request.session.userId = user._id;

        response.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export const logOut: RequestHandler = async (request, response, next) => {
    request.session.destroy((error) => {
        if (error) {
            next(error);
        } else {
            response.sendStatus(204);
        }
    });
};
