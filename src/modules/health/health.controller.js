import { prisma } from "../../db/prisma.js";

export async function getHealth(req, res) {
    try {
        await prisma.$queryRaw`SELECT 1`;

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
}
