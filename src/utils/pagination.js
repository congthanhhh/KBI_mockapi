export function parsePagination(query) {
    const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

export function buildPaginationMeta({ page, limit, total }) {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
    };
}
