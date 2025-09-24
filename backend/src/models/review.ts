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
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
        required: true,
    },
}, { timestamps: true });

type Review = mongoose.InferSchemaType<typeof reviewSchema>;

export default mongoose.model<Review>("Review", reviewSchema);
