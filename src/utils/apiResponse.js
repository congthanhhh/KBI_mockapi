export function success(data, meta = {}) {
    return {
        data,
        meta,
        errors: []
    };
}

export function error(errorCode, message, details = {}, httpStatus = 500) {
    const apiError = new Error(message);
    apiError.statusCode = httpStatus;
    apiError.code = errorCode;
    apiError.details = details;
    return apiError;
}
