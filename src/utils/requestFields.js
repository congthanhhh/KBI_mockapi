export function pickAllowedFields(body, allowedColumns) {
    return allowedColumns
        .filter((column) => Object.hasOwn(body, column))
        .map((column) => [column, body[column]]);
}
