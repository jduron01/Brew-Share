import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    commenter: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const recipeSchema = new mongoose.Schema({
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
        type: [String],
        required: true,
    },
    reviews: {
        type: [reviewSchema],
    },
}, { timestamps: true });

type Recipe = mongoose.InferSchemaType<typeof recipeSchema>;

export default mongoose.model<Recipe>("Recipe", recipeSchema);
