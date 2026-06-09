import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

function buildItemWhere({ q, itemGroupId }) {
    const where = {
        is_delete: false
    };

    if (itemGroupId) {
        where.item_group_id = itemGroupId;
    }

    if (!q) {
        return where;
    }

    const searchableColumns = [
        "item_code",
        "item_name",
        "item_description",
        "unit",
        "item_type",
        "origin_country"
    ];

    where.OR = searchableColumns.map((column) => ({
        [column]: {
            contains: q,
            mode: "insensitive"
        }
    }));

    return where;
}

export async function findItems({ q, itemGroupId, limit, offset }) {
    const where = buildItemWhere({ q, itemGroupId });

    const [items, total] = await Promise.all([
        prisma.itemMaster.findMany({
            where,
            take: limit,
            skip: offset,
            include: {
                item_group: true
            },
            orderBy: [
                { create_at: "desc" },
                { id: "desc" }
            ]
        }),
        prisma.itemMaster.count({ where })
    ]);

    return {
        items,
        total
    };
}

export async function findItemById(id) {
    return prisma.itemMaster.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: {
            item_group: true
        }
    });
}

export async function createItem(fields) {
    return prisma.itemMaster.create({
        data: fieldsToData(fields)
    });
}

export async function updateItem(id, fields) {
    const item = await findItemById(id);

    if (!item) {
        return null;
    }

    return prisma.itemMaster.update({
        where: { id },
        data: fieldsToData(fields)
    });
}

export async function softDeleteItem(id) {
    return prisma.$transaction(async (tx) => {
        const item = await tx.itemMaster.findFirst({
            where: {
                id,
                is_delete: false
            }
        });

        if (!item) {
            return null;
        }

        const deletedItem = await tx.itemMaster.update({
            where: { id },
            data: {
                is_delete: true,
                delete_at: new Date()
            }
        });

        const deletedProfiles = await tx.itemCustomsProfile.updateMany({
            where: {
                item_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: new Date()
            }
        });

        return {
            ...deletedItem,
            deleted_tax_profiles: deletedProfiles.count
        };
    });
}

export async function findTaxProfilesByItemId(itemId) {
    return prisma.itemCustomsProfile.findMany({
        where: {
            item_id: itemId,
            is_delete: false
        },
        orderBy: [
            { create_at: "desc" },
            { id: "desc" }
        ]
    });
}

export async function createTaxProfileForItem(itemId, fields) {
    return prisma.itemCustomsProfile.create({
        data: {
            item_id: itemId,
            ...fieldsToData(fields)
        }
    });
}
