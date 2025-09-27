import mongoose from "mongoose";
import { ingredientSchema } from "../schemas/ingredient.js";

export enum BrewMethod {
    Espresso = "espresso",
    PourOver = "pour-over",
    FrenchPress = "french-press",
    AeroPress = "aero-press",
    ColdBrew = "cold-brew",
    MokaPot = "moka-pot",
    Other = "other",
};

export enum Difficulty {
    Beginner = "beginner",
    Intermediate = "intermediate",
    Expert = "expert",
};

export const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
    },
    instructions: {
        type: [String],
        required: true,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    ingredients: {
        type: [ingredientSchema],
        required: true,
    },
    brewMethod: {
        type: String,
        enum: BrewMethod,
        default: "other",
    },
    brewTime: {
        type: Number,
        min: 0,
    },
    difficulty: {
        type: String,
        enum: Difficulty,
        default: "intermediate",
    },
    averageRating: {
        type: Number,
    },
}, { timestamps: true });

type Recipe = mongoose.InferSchemaType<typeof recipeSchema>;

export default mongoose.model<Recipe>("Recipe", recipeSchema);
