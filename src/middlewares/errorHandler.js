export function errorHandler(error, req, res, next) {
    const prismaError = mapPrismaError(error);
    const statusCode = error.statusCode || prismaError.statusCode || 500;

    if (req.originalUrl?.startsWith("/api/v1")) {
        res.status(statusCode).json({
            data: null,
            meta: {},
            errors: [
                {
                    code: prismaError.code || error.code || (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "API_ERROR"),
                    message: prismaError.message || error.message || "Internal server error"
                }
            ]
        });
        return;
    }

    res.status(statusCode).json({
        message: error.message || "Internal server error",
        ...(statusCode === 500 ? { error: error.message } : {})
    });
}

function mapPrismaError(error) {
    if (error.code === "P2002") {
        const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
        let message = `Duplicate ${target.length ? target.join(", ") : "unique field"}`;

        if (target.includes("purchase_order_id") && target.includes("lot_no")) {
            message = "lot_no already exists in this purchase order";
        }

        if (target.includes("purchase_order_id") && target.includes("slot_no")) {
            message = "slot_no already exists in this purchase order";
        }

        return {
            statusCode: 409,
            code: "STATE_CONFLICT",
            message
        };
    }

    if (error.code === "P2003") {
        return {
            statusCode: 400,
            code: "VALIDATION_ERROR",
            message: "Invalid referenced record"
        };
    }

    if (error.code === "P2025") {
        return {
            statusCode: 404,
            code: "NOT_FOUND",
            message: "Record not found"
        };
    }

    return {};
}
