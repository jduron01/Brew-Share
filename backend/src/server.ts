import express from "express";
import cors from "cors";
import session from "express-session";
import lusca from "lusca";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import env from "./util/validate.js";
import connectDB from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import requiresAuth from "./middleware/auth.js";
import { apiRateLimiter } from "./middleware/rateLimiters.js";
import { handleHttpErrors, handleUnfoundEndpoint } from "./middleware/errorHandlers.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
}));
app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
        secure: env.NODE_ENV === "production",
    },
    rolling: true,
    store: MongoStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING,
    }),
}));
// app.use(lusca.csrf());
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reviews", requiresAuth, apiRateLimiter, reviewRoutes);
app.use(handleUnfoundEndpoint);
app.use(handleHttpErrors);

connectDB()
    .then(() => {
        app.listen(env.PORT, () => {
            console.log("Server listening on port " + env.PORT);
        });
    })
    .catch(console.error);
