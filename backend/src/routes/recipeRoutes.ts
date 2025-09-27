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
import { recipeValidators } from "../middleware/validators.js";
import { handleValidationErrors } from "../middleware/validationHandler.js";

const router = express.Router();

router.get('/', apiRateLimiter, getRecipes);
router.get('/:id', recipeValidators.idParam, handleValidationErrors, apiRateLimiter, getRecipe);
router.post('/', requiresAuth, recipeValidators.create, handleValidationErrors, apiRateLimiter, createRecipe);
router.patch('/:id', requiresAuth, recipeValidators.update, handleValidationErrors, apiRateLimiter, updateRecipe);
router.delete('/:id', requiresAuth, recipeValidators.idParam, handleValidationErrors, apiRateLimiter, deleteRecipe);

export default router;
