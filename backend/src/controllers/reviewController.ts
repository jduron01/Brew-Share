import type { RequestHandler } from "express";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import Review from "../models/review.js";
import User from "../models/user.js";
import Recipe from "../models/recipe.js";
import assertIsDefined from "../util/assertIsDefined.js";

export const getReviews: RequestHandler = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;

    try {
        assertIsDefined(authenticatedUserId);
        const reviews = await Review.find({ user: authenticatedUserId }).sort({ createdAt: -1 }).exec();
        response.status(200).json(reviews);
    } catch (error) {
        next(error);
    }
};

interface CreateReviewParams {
    recipeId?: string,
};

interface CreateReviewBody {
    comment: string,
    rating: number,
    commenter: string,
};

export const createReview: RequestHandler<CreateReviewParams, unknown, CreateReviewBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const recipeId = request.params.recipeId;
    const { comment, rating } = request.body;

    try {
        assertIsDefined(authenticatedUserId);
        assertIsDefined(recipeId);

        const user = await User.findById(authenticatedUserId).exec();

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        if (!mongoose.isValidObjectId(recipeId)) {
            throw createHttpError(400, "Invalid recipe ID");
        }

        if (!comment) {
            throw createHttpError(400, "Review is missing comment");
        }

        if (!rating) {
            throw createHttpError(400, "Review is missing rating");
        }

        if (rating < 1 || rating > 5) {
            throw createHttpError(400, "Rating needs to be between 1 and 5 inclusive");
        }

        const reviewedRecipe = await Recipe.findById(recipeId).exec();

        if (!reviewedRecipe) {
            throw createHttpError(404, "Recipe not found");
        }

        const commenter = user.username;
        const savedReview = await Review.create({
            comment,
            rating,
            commenter,
            recipe: reviewedRecipe,
        });

        reviewedRecipe.reviews.push(savedReview._id);
        await reviewedRecipe.save();

        response.status(201).json(reviewedRecipe);
    } catch (error) {
        next(error);
    }
};

interface UpdateReviewParams {
    id?: string,
};

interface UpdateReviewBody {
    comment?: string,
    rating?: number,
};

export const updateReview: RequestHandler<UpdateReviewParams, unknown, UpdateReviewBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const reviewId = request.params.id;
    const { comment, rating } = request.body;

    try {
        assertIsDefined(authenticatedUserId);
        assertIsDefined(reviewId);

        if (!mongoose.isValidObjectId(reviewId)) {
            throw createHttpError(400, "Invalid review ID");
        }

        if (comment && typeof comment !== "string") {
            throw createHttpError(400, "Invalid comment");
        }

        if (rating) {
            if (typeof rating !== "number") {
                throw createHttpError(400, "Invalid rating");
            }

            if (rating < 1 || rating > 5) {
                throw createHttpError(400, "Rating needs to be between 1 and 5 inclusive");
            }
        }

        const updatedReview = await Review.findOneAndUpdate(
            { _id: reviewId, user: authenticatedUserId, },
            { comment, rating },
            { new: true },
        );

        if (!updatedReview) {
            throw createHttpError(404, "Review not found");
        }

        const reviewedRecipe = await Recipe.findById(updatedReview.recipe);

        if (!reviewedRecipe) {
            throw createHttpError(400, "Recipe not found");
        }

        response.status(200).json(reviewedRecipe);
    } catch (error) {
        next(error);
    }
};

interface DeleteReviewParams {
    id?: string,
};

export const deleteReview: RequestHandler<DeleteReviewParams, unknown, unknown, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const reviewId = request.params.id;

    try {
        assertIsDefined(authenticatedUserId);
        assertIsDefined(reviewId);

        if (!mongoose.isValidObjectId(reviewId)) {
            throw createHttpError(400, "Invalid review ID");
        }

        const deletedReview = await Review.findOneAndDelete({ _id: reviewId, user: authenticatedUserId }).exec();

        if (!deletedReview) {
            throw createHttpError(404, "Review not found");
        }

        const reviewedRecipe = await Recipe.findById(deletedReview.recipe);

        if (!reviewedRecipe) {
            throw createHttpError(404, "Recipe not found");
        }

        reviewedRecipe.reviews = reviewedRecipe.reviews.filter((id) => !id.equals(deletedReview._id));
        await reviewedRecipe.save();

        response.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
