import express from "express";
import {
    getRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
} from "../controllers/recipeController.js";
import requiresAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.post("/", requiresAuth, createRecipe);
router.patch("/:id", requiresAuth, updateRecipe);
router.delete("/:id", requiresAuth, deleteRecipe);

export default router;
