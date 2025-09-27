import type { Ingredient } from "../schemas/ingredient.js";
import { normalizeUnit } from "./unitNormalizer.js";
import createHttpError from "http-errors";

export const validateIngredients = (ingredients: Ingredient[]) => {
    const warnings: string[] = [];

    const validatedIngredients = ingredients.map((ingredient, index) => {
        if (!ingredient.quantity) {
            throw createHttpError(400, `Ingredient at index ${index} is missing quantity`);
        }

        if (!ingredient.unit) {
            throw createHttpError(400, `Ingredient at index ${index} is missing unit`);
        }

        if (!ingredient.name) {
            throw createHttpError(400, `Ingredient at index ${index} is missing name`);
        }

        const normalization = normalizeUnit(ingredient.unit);

        if (!normalization.wasNormalized) {
            warnings.push(`Unit '${ingredient.unit}' was not recognized for '${ingredient.name}'`);
        }

        return {
            ...ingredient,
            unit: normalization.normalizedUnit,
        };
    });

    return { validatedIngredients, warnings };
};
