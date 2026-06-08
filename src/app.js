import express from "express";
import cors from "cors";
import importTaxLinesRouter from "./routes/importTaxLines.routes.js";
import { query } from "./db/pool.js";

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({
    origin: CORS_ORIGIN
}));

app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        await query("SELECT 1");

        res.json({
            status: "ok",
            service: "eFMS API",
            database: "connected"
        });
    } catch (error) {
        res.status(503).json({
            status: "error",
            service: "eFMS API",
            database: "disconnected",
            message: error.message
        });
    }
});

app.use("/api/import-tax-lines", importTaxLinesRouter);

app.listen(PORT, () => {
    console.log(`eFMS API is running on port ${PORT}`);
});
