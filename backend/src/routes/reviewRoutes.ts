import express from "express";
import {
    createReview,
    deleteReview,
    getReviews,
    updateReview
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/my-reviews", getReviews);
router.post("/:recipeId", createReview);
router.patch("/:id", updateReview);
router.delete("/my-reviews/:id", deleteReview);

export default router;
