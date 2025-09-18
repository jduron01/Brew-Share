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
    id: string,
};

export const getRecipe: RequestHandler<GetRecipeParams, unknown, unknown, unknown> = async (request, response, next) => {
    const recipeId = request.params.id;

    try {
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
    names: string[],
    quantities: string[],
};

export const createRecipe: RequestHandler<unknown, unknown, CreateRecipeBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const { title, instructions, description, imageUrl, names, quantities } = request.body;

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

        if (!names || names.length === 0) {
            throw createHttpError(400, "Recipe ingredient names are missing");
        }

        if (!quantities || quantities.length === 0) {
            throw createHttpError(400, "Recipe ingredient quantities are missing");
        }

        const ingredients = await processIngredients(names, quantities);
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
    id: string,
};

interface UpdateRecipeBody {
    title?: string,
    author?: string,
    instructions?: string[],
    description?: string,
    imageUrl?: string,
    names?: string[],
    quantities?: string[],
};

export const updateRecipe: RequestHandler<UpdateRecipeParams, unknown, UpdateRecipeBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const recipeId = request.params.id;
    const { title, instructions, description, imageUrl, names, quantities } = request.body;
    let ingredients;

    try {
        assertIsDefined(authenticatedUserId);

        if (!mongoose.isValidObjectId(recipeId)) {
            throw createHttpError(400, "Invalid recipe ID");
        }

        if (names && quantities && names.length === quantities.length) {
            ingredients = await processIngredients(names, quantities);
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
    id: string,
};

export const deleteRecipe: RequestHandler<DeleteRecipeParams, unknown, unknown, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const recipeId = request.params.id;

    try {
        assertIsDefined(authenticatedUserId);

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

const processIngredients = async (names: string[], quantities: string[]) => {
    if (!names || !quantities || names.length !== quantities.length) {
        throw createHttpError(400, "Ingredient names don't match quantities");
    }

    return Promise.all(names.map(async (name, i) => {
        let quantity = quantities[i];

        if (!name || !name.trim()) {
            throw createHttpError(400, "Ingredient name missing");
        }

        if (!quantity || !quantity.trim()) {
            throw createHttpError(400, "Ingredient quantity missing");
        }

        name = name.trim().toLowerCase();
        quantity = quantity.trim().toLowerCase();
        let ingredient = quantity + " " + name;

        return ingredient;
    }));
};
