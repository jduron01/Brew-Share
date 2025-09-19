import express from "express";
import {
    createReview,
    deleteReview,
    getReviews,
    updateReview
} from "../controllers/reviewController.js";
import requiresAuth from "../middleware/auth.js";
import { apiRateLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/my-reviews", requiresAuth, apiRateLimiter, getReviews);
router.post("/:recipeId", requiresAuth, apiRateLimiter, createReview);
router.patch("/:id", requiresAuth, apiRateLimiter, updateReview);
router.delete("/my-reviews/:id", requiresAuth, apiRateLimiter, deleteReview);

export default router;
