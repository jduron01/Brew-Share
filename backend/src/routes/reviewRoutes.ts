import express from "express";
import {
    getMyReviews,
    createReview,
    deleteReview,
    updateReview
} from "../controllers/reviewController.js";
import { reviewValidators } from "../middleware/validators.js";
import { handleValidationErrors } from "../middleware/validationHandler.js";

const router = express.Router();

router.get("/my-reviews", getMyReviews);
router.post("/:recipeId", reviewValidators.create, handleValidationErrors, createReview);
router.patch("/:id", reviewValidators.create, handleValidationErrors, updateReview);
router.delete("/my-reviews/:id", reviewValidators.idParam, handleValidationErrors, deleteReview);

export default router;
