import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import Review from "../models/review.js";
import Recipe from "../models/recipe.js";
import User from "../models/user.js";
import assertIsDefined from "../util/assertIsDefined.js";

export const getMyReviews: RequestHandler = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;

    try {
        assertIsDefined(authenticatedUserId);

        const user = await User.findById(authenticatedUserId).exec();

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        const reviews = await Review.find({ commenter: user.username }).sort({ createdAt: -1 }).exec();

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
    rating: string,
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

        const reviewedRecipe = await Recipe.findById(recipeId).exec();

        if (!reviewedRecipe) {
            throw createHttpError(404, "Recipe not found");
        }

        if (user.username === reviewedRecipe.author) {
            throw createHttpError(403, "Users cannot review their own recipe");
        }

        const review = await Review.create({
            comment,
            rating,
            commenter: user.username,
            recipe: reviewedRecipe._id,
        });

        if (!review) {
            throw createHttpError(500, "Error creating review for recipe");
        }

        let totalRating = 0;
        const recipeReviews = await Review.find({ recipe: reviewedRecipe._id }).exec();

        if (!recipeReviews) {
            throw createHttpError(500, "Error finding reviews associated with recipe");
        }

        recipeReviews.map(review => {
            totalRating += review.rating;
        });

        reviewedRecipe.averageRating = totalRating / recipeReviews.length;
        await reviewedRecipe.save();

        response.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

interface UpdateReviewParams {
    id?: string,
};

interface UpdateReviewBody {
    comment?: string,
    rating?: string,
};

export const updateReview: RequestHandler<UpdateReviewParams, unknown, UpdateReviewBody, unknown> = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    const reviewId = request.params.id;
    const { comment, rating } = request.body;

    try {
        assertIsDefined(authenticatedUserId);
        assertIsDefined(reviewId);

        const user = await User.findById(authenticatedUserId).exec();

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        const updatedReview = await Review.findOneAndUpdate(
            { _id: reviewId, commenter: user.username, },
            { comment, rating },
            { new: true },
        );

        if (!updatedReview) {
            throw createHttpError(404, "Review not found");
        }

        const reviewedRecipe = await Recipe.findById(updatedReview.recipe).exec();

        if (!reviewedRecipe) {
            throw createHttpError(400, "Recipe not found");
        }

        let totalRating = 0;
        const recipeReviews = await Review.find({ recipe: reviewedRecipe._id }).exec();

        if (!recipeReviews) {
            throw createHttpError(500, "Error finding reviews associated with recipe");
        }

        recipeReviews.map(review => {
            totalRating += review.rating;
        });

        reviewedRecipe.averageRating = totalRating / recipeReviews.length;
        await reviewedRecipe.save();

        response.status(200).json(updatedReview);
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

        const user = await User.findById(authenticatedUserId).exec();

        if (!user) {
            throw createHttpError(401, "User not authenticated");
        }

        const deletedReview = await Review.findOneAndDelete({ _id: reviewId, commenter: user.username }).exec();

        if (!deletedReview) {
            throw createHttpError(404, "Review not found");
        }

        const reviewedRecipe = await Recipe.findById(deletedReview.recipe).exec();

        if (!reviewedRecipe) {
            throw createHttpError(404, "Recipe not found");
        }

        let totalRating = 0;
        const recipeReviews = await Review.find({ recipe: reviewedRecipe._id }).exec();

        if (!recipeReviews) {
            throw createHttpError(500, "Error finding reviews associated with recipe");
        }

        recipeReviews.map(review => {
            totalRating += review.rating;
        });

        reviewedRecipe.averageRating = totalRating / recipeReviews.length;
        await reviewedRecipe.save();

        response.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
