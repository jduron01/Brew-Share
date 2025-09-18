import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
}, { timestamps: true });

type Recipe = mongoose.InferSchemaType<typeof recipeSchema>;

export default mongoose.model<Recipe>("Recipe", recipeSchema);
