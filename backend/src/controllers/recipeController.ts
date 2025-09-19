import type { RequestHandler } from "express";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import Recipe from "../models/recipe.js";
import User from "../models/user.js";
import assertIsDefined from "../util/assertIsDefined.js";

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

        if (!mongoose.isValidObjectId(recipeId)) {
            throw createHttpError(400, "Invalid recipe ID");
        }

        const recipe = await Recipe.findById(recipeId).exec();

        if (!recipe) {
            throw createHttpError(404, "Recipe not found");
        }

        response.status(200).json(recipe);
    } catch (error) {
        next(error);
    }
};

interface CreateRecipeBody {
    title: string,
    author: string,
    instructions: string[],
    description?: string,
    imageUrl?: string,
    quantities: string[],
    names: string[],
};

export const createRecipe: RequestHandler<unknown, unknown, CreateRecipeBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const { title, instructions, description, imageUrl, quantities, names } = request.body;

    try {
        assertIsDefined(authenticatedUserId);

        const user = await User.findById(authenticatedUserId).exec();

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        if (!title) {
            throw createHttpError(400, "Recipe title is missing");
        }

        if (!instructions || instructions.length === 0) {
            throw createHttpError(400, "Recipe instructions are missing");
        }

        if (!quantities || quantities.length === 0) {
            throw createHttpError(400, "Recipe ingredient quantities are missing");
        }

        if (!names || names.length === 0) {
            throw createHttpError(400, "Recipe ingredient names are missing");
        }

        const ingredients = await processIngredients(quantities, names);
        const savedRecipe = await Recipe.create({
            title,
            user,
            instructions,
            description,
            imageUrl,
            ingredients,
        });

        if (!savedRecipe) {
            throw createHttpError(500, "Error saving recipe");
        }

        user.recipes.push(savedRecipe._id);
        await user.save();

        response.status(201).json(savedRecipe);
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
    quantities?: string[],
    names?: string[],
};

export const updateRecipe: RequestHandler<UpdateRecipeParams, unknown, UpdateRecipeBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const recipeId = request.params.id;
    const { title, instructions, description, imageUrl, quantities, names } = request.body;
    let ingredients;

    try {
        assertIsDefined(authenticatedUserId);
        assertIsDefined(recipeId);

        if (!mongoose.isValidObjectId(recipeId)) {
            throw createHttpError(400, "Invalid recipe ID");
        }

        if (title && typeof title !== "string") {
            throw createHttpError(400, "Invalid recipe title");
        }

        if (instructions) {
            for (const instruction of instructions) {
                if (typeof instruction !== "string") {
                    throw createHttpError(400, "One or more recipe instructions are invalid");
                }
            }
        }

        if (description && typeof description !== "string") {
            throw createHttpError(400, "Recipe description is invalid");
        }

        if (imageUrl && typeof imageUrl !== "string") {
            throw createHttpError(400, "Recipe image URL is invalid");
        }

        if (quantities && names) {
            for (const quantity of quantities) {
                if (typeof quantity !== "string") {
                    throw createHttpError(400, "One or more ingredient quantities are invalid");
                }
            }

            for (const name of names) {
                if (typeof name !== "string") {
                    throw createHttpError(400, "One or more ingredient names are invalid");
                }
            }

            ingredients = await processIngredients(quantities, names);
        }

        const updatedRecipe = await Recipe.findOneAndUpdate(
            { _id: recipeId, user: authenticatedUserId, },
            { title, instructions, description, imageUrl, ingredients, },
            { new: true },
        ).exec();

        if (!updatedRecipe) {
            throw createHttpError(404, "Recipe not found");
        }

        response.status(200).json(updatedRecipe);
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

        if (!mongoose.isValidObjectId(recipeId)) {
            throw createHttpError(400, "Invalid recipe ID");
        }

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        const deletedRecipe = await Recipe.findOneAndDelete({ _id: recipeId, user, }).exec();

        if (!deletedRecipe) {
            throw createHttpError(404, "Recipe not found");
        }

        user.recipes = user.recipes.filter((id) => !id.equals(deletedRecipe._id));
        await user.save();

        response.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

const processIngredients = async (quantities: string[], names: string[]) => {
    if (quantities.length !== names.length) {
        throw createHttpError(400, "Ingredient names don't match quantities");
    }

    return Promise.all(quantities.map(async (quantity, i) => {
        let name = names[i];

        if (!quantity || !quantity.trim()) {
            throw createHttpError(400, "Ingredient quantity missing");
        }

        if (!name || !name.trim()) {
            throw createHttpError(400, "Ingredient name missing");
        }

        quantity = quantity.trim().toLowerCase();
        name = name.trim().toLowerCase();
        let ingredient = quantity + " " + name;

        return ingredient;
    }));
};
