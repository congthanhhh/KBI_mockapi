export function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        message: error.message || "Internal server error",
        ...(statusCode === 500 ? { error: error.message } : {})
    });
}
