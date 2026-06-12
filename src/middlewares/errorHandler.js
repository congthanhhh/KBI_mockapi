export function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;

    if (req.originalUrl?.startsWith("/api/v1")) {
        res.status(statusCode).json({
            data: null,
            meta: {},
            errors: [
                {
                    error_code: error.code || (statusCode === 500 ? "INTERNAL_ERROR" : "VALIDATION_ERROR"),
                    message: error.message || "Internal server error",
                    details: error.details || {}
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
