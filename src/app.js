import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import apiRouter from "./routes/mock.js";

const app = express();

app.use(cors({
    origin: env.corsOrigin
}));

app.use(express.json());

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
