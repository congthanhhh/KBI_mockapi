import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

function buildIncotermWhere({ search, isActive }) {
    const where = {
        is_delete: false
    };

    if (isActive !== undefined) {
        where.is_active = isActive;
    }

    if (search) {
        where.OR = [
            "incoterm_code",
            "incoterm_name",
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

export async function findIncoterms({ search, isActive, limit, offset }) {
    const where = buildIncotermWhere({ search, isActive });

    const [incoterms, total] = await Promise.all([
        prisma.incoterm.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: [
                { incoterm_code: "asc" },
                { id: "asc" }
            ]
        }),
        prisma.incoterm.count({ where })
    ]);

    return {
        incoterms,
        total
    };
}

export async function findIncotermById(id) {
    return prisma.incoterm.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function createIncoterm(fields) {
    return prisma.incoterm.create({
        data: fieldsToData(fields)
    });
}

export async function updateIncoterm(id, fields) {
    const incoterm = await findIncotermById(id);

    if (!incoterm) {
        return null;
    }

    return prisma.incoterm.update({
        where: { id },
        data: fieldsToData(fields)
    });
}

export async function softDeleteIncoterm(id) {
    const incoterm = await findIncotermById(id);

    if (!incoterm) {
        return null;
    }

    return prisma.incoterm.update({
        where: { id },
        data: {
            is_delete: true,
            delete_at: new Date()
        }
    });
}

export async function findIncotermOptions() {
    return prisma.incoterm.findMany({
        where: {
            is_delete: false,
            is_active: true
        },
        orderBy: [
            { incoterm_code: "asc" },
            { id: "asc" }
        ]
    });
}
