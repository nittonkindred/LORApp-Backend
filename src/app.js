import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import routes from "./routes/health.js";
import cardRoutes from "./routes/card.route.js";
import metadataRoutes from "./routes/metadata.route.js";
import userRoutes from "./routes/auth.route.js";
import deckRoutes from "./routes/deck.route.js";
import profileRoutes from "./routes/user.route.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/health", routes);
app.use("/api/cards", cardRoutes);
app.use("/api", metadataRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api/users", profileRoutes);

export default app;
