import express from "express";
import {
    getAuthenticatedUser,
    getUserRecipes,
    signUp,
    logIn,
    logOut
} from "../controllers/userController.js";
import requiresAuth from "../middleware/auth.js";
import { authRateLimiter, apiRateLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/", requiresAuth, authRateLimiter, getAuthenticatedUser);
router.get("/:username", apiRateLimiter, getUserRecipes);
router.post("/signup", authRateLimiter, signUp);
router.post("/login", authRateLimiter, logIn);
router.post("/logout", requiresAuth, authRateLimiter, logOut);

export default router;
