import mongoose from "mongoose";

export enum Category {
    Coffee = "coffee",
    Water = "water",
    Sweetener = "sweetener",
    Flavoring = "flavoring",
    Other = "other",
};

export const ingredientSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    unit: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    category: {
        type: String,
        enum: Category,
        default: "other",
    },
});

export type Ingredient = mongoose.InferSchemaType<typeof ingredientSchema>;
