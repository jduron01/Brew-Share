import express from "express";
import {
    getAuthenticatedUser,
    getUserRecipes,
    signUp,
    logIn,
    logOut
} from "../controllers/userController.js";
import requiresAuth from "../middleware/auth.js";

const router = express.Router();

router.get("/", requiresAuth, getAuthenticatedUser);
router.get("/:username", getUserRecipes);
router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", requiresAuth, logOut);

export default router;
