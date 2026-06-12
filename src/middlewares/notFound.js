export function notFound(req, res) {
    if (req.originalUrl?.startsWith("/api/v1")) {
        res.status(404).json({
            data: null,
            meta: {},
            errors: [
                {
                    error_code: "NOT_FOUND",
                    message: "Route not found",
                    details: {}
                }
            ]
        });
        return;
    }

    res.status(404).json({
        message: "Route not found"
    });
}
