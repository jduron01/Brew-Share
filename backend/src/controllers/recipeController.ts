import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import Recipe from "../models/recipe.js";
import type { Ingredient } from "../schemas/ingredient.js";
import Review from "../models/review.js";
import User from "../models/user.js";
import assertIsDefined from "../util/assertIsDefined.js";
import { validateIngredients } from "../util/validateIngredient.js";

export const getRecipes: RequestHandler = async (request, response, next) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 }).exec();
        response.status(200).json(recipes);
    } catch (error) {
        next(error);
    }
};

interface GetRecipeParams {
    id?: string,
};

export const getRecipe: RequestHandler<GetRecipeParams, unknown, unknown, unknown> = async (request, response, next) => {
    const recipeId = request.params.id;

    try {
        assertIsDefined(recipeId);

        const data = await Recipe.findById(recipeId).exec();

        if (!data) {
            throw createHttpError(404, "Recipe not found");
        }

        const reviews = await Review.find({ recipe: recipeId }).sort({ createdAt: -1 }).exec();

        if (!reviews) {
            throw createHttpError(404, "Reviews associated with recipe not found");
        }

        response.status(200).json({ data, reviews });
    } catch (error) {
        next(error);
    }
};

interface CreateRecipeBody {
    title: string,
    instructions: string[],
    description?: string,
    imageUrl?: string,
    ingredients: Ingredient[],
    brewMethod?: string,
    brewTime?: number,
    difficulty?: string,
};

export const createRecipe: RequestHandler<unknown, unknown, CreateRecipeBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const { title, instructions, description, imageUrl, ingredients, brewMethod, brewTime, difficulty } = request.body;

    try {
        assertIsDefined(authenticatedUserId);

        const user = await User.findById(authenticatedUserId).exec();

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        const { validatedIngredients, warnings } = validateIngredients(ingredients);
        const savedRecipe = await Recipe.create({
            title,
            author: user.username,
            instructions,
            description,
            imageUrl,
            ingredients: validatedIngredients,
            brewMethod,
            brewTime,
            difficulty,
        });

        response.status(201).json({ savedRecipe, warnings });
    } catch (error) {
        next(error);
    }
};

interface UpdateRecipeParams {
    id?: string,
};

interface UpdateRecipeBody {
    title?: string,
    author?: string,
    instructions?: string[],
    description?: string,
    imageUrl?: string,
    ingredients?: Ingredient[],
    brewMethod?: string,
    brewTime?: number,
    difficulty?: string,
};

export const updateRecipe: RequestHandler<UpdateRecipeParams, unknown, UpdateRecipeBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const recipeId = request.params.id;
    const { title, instructions, description, imageUrl, ingredients, brewMethod, brewTime, difficulty } = request.body;

    try {
        assertIsDefined(authenticatedUserId);
        assertIsDefined(recipeId);

        const user = await User.findById(authenticatedUserId).exec();

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        let validatedIngredients, warnings;

        if (ingredients) {
            const result = validateIngredients(ingredients);
            validatedIngredients = result.validatedIngredients;
            warnings = result.warnings;
        }

        const updatedRecipe = await Recipe.findOneAndUpdate(
            { _id: recipeId, author: user.username },
            { title, instructions, description, imageUrl, ingredients: validatedIngredients, brewMethod, brewTime, difficulty },
            { new: true },
        ).exec();

        if (!updatedRecipe) {
            throw createHttpError(404, "Recipe not found");
        }

        response.status(200).json({ updatedRecipe, warnings });
    } catch (error) {
        next(error);
    }
};

interface DeleteRecipeParams {
    id?: string,
};

export const deleteRecipe: RequestHandler<DeleteRecipeParams, unknown, unknown, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const recipeId = request.params.id;

    try {
        assertIsDefined(authenticatedUserId);
        assertIsDefined(recipeId);

        const user = await User.findById(authenticatedUserId).exec();

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        const deletedRecipe = await Recipe.findOneAndDelete({ _id: recipeId, author: user.username, }).exec();

        if (!deletedRecipe) {
            throw createHttpError(404, "Recipe not found");
        }

        const deletedReviews = await Review.deleteMany({ recipe: deletedRecipe._id }).exec();

        if (!deletedReviews) {
            throw createHttpError(500, "Error in deleting reviews associated with deleted recipe");
        }

        response.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
