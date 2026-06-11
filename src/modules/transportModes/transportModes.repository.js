import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

function buildTransportModeWhere({ search, modeType, isInternational, isActive }) {
    const where = {
        is_delete: false
    };

    if (modeType) {
        where.mode_type = {
            equals: modeType,
            mode: "insensitive"
        };
    }

    if (isInternational !== undefined) {
        where.is_international = isInternational;
    }

    if (isActive !== undefined) {
        where.is_active = isActive;
    }

    if (search) {
        where.OR = [
            "mode_code",
            "mode_name",
            "mode_type",
            "description"
        ].map((column) => ({
            [column]: {
                contains: search,
                mode: "insensitive"
            }
        }));
    }

    return where;
}

export async function findTransportModes({ search, modeType, isInternational, isActive, limit, offset }) {
    const where = buildTransportModeWhere({ search, modeType, isInternational, isActive });

    const [transportModes, total] = await Promise.all([
        prisma.transportMode.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: [
                { mode_code: "asc" },
                { id: "asc" }
            ]
        }),
        prisma.transportMode.count({ where })
    ]);

    return {
        transportModes,
        total
    };
}

export async function findTransportModeById(id) {
    return prisma.transportMode.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function createTransportMode(fields) {
    return prisma.transportMode.create({
        data: fieldsToData(fields)
    });
}

export async function updateTransportMode(id, fields) {
    const transportMode = await findTransportModeById(id);

    if (!transportMode) {
        return null;
    }

    return prisma.transportMode.update({
        where: { id },
        data: fieldsToData(fields)
    });
}

export async function softDeleteTransportMode(id) {
    const transportMode = await findTransportModeById(id);

    if (!transportMode) {
        return null;
    }

    return prisma.transportMode.update({
        where: { id },
        data: {
            is_delete: true,
            delete_at: new Date()
        }
    });
}

export async function findTransportModeOptions() {
    return prisma.transportMode.findMany({
        where: {
            is_delete: false,
            is_active: true
        },
        orderBy: [
            { mode_code: "asc" },
            { id: "asc" }
        ]
    });
}
