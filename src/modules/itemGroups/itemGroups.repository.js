import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

function buildItemGroupWhere(q) {
    const where = {
        is_delete: false
    };

    if (!q) {
        return where;
    }

    const searchableColumns = [
        "group_code",
        "group_name",
        "description",
        "default_hs_code"
    ];

    where.OR = searchableColumns.map((column) => ({
        [column]: {
            contains: q,
            mode: "insensitive"
        }
    }));

    return where;
}

export async function findItemGroups({ q, limit, offset }) {
    const where = buildItemGroupWhere(q);

    const [itemGroups, total] = await Promise.all([
        prisma.itemGroup.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: [
                { create_at: "desc" },
                { id: "desc" }
            ]
        }),
        prisma.itemGroup.count({ where })
    ]);

    return {
        itemGroups,
        total
    };
}

export async function findItemGroupById(id) {
    return prisma.itemGroup.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function createItemGroup(fields) {
    return prisma.itemGroup.create({
        data: fieldsToData(fields)
    });
}

export async function updateItemGroup(id, fields) {
    const itemGroup = await findItemGroupById(id);

    if (!itemGroup) {
        return null;
    }

    return prisma.itemGroup.update({
        where: { id },
        data: fieldsToData(fields)
    });
}

export async function softDeleteItemGroup(id) {
    const itemGroup = await findItemGroupById(id);

    if (!itemGroup) {
        return null;
    }

    return prisma.itemGroup.update({
        where: { id },
        data: {
            is_delete: true,
            delete_at: new Date()
        }
    });
}
