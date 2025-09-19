import express from "express";
import {
    getRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
} from "../controllers/recipeController.js";
import requiresAuth from "../middleware/auth.js";
import { apiRateLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/", apiRateLimiter, getRecipes);
router.get("/:id", apiRateLimiter, getRecipe);
router.post("/", requiresAuth, apiRateLimiter, createRecipe);
router.patch("/:id", requiresAuth, apiRateLimiter, updateRecipe);
router.delete("/:id", requiresAuth, apiRateLimiter, deleteRecipe);

export default router;
