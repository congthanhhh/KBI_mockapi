export function parseOptionalBoolean(value) {
    if (value === undefined) {
        return undefined;
    }

    if (value === true || value === "true") {
        return true;
    }

    if (value === false || value === "false") {
        return false;
    }

    return undefined;
}

export function parseTypes(value, allowedTypes) {
    if (!value) {
        return allowedTypes;
    }

    const requestedTypes = String(value)
        .split(",")
        .map((type) => type.trim())
        .filter(Boolean);

    return requestedTypes.filter((type) => allowedTypes.includes(type));
}
