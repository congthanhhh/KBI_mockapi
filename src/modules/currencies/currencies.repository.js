import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

function buildCurrencyWhere({ search, isActive }) {
    const where = {
        is_delete: false
    };

    if (isActive !== undefined) {
        where.is_active = isActive;
    }

    if (search) {
        where.OR = [
            "currency_code",
            "currency_name",
            "symbol"
        ].map((column) => ({
            [column]: {
                contains: search,
                mode: "insensitive"
            }
        }));
    }

    return where;
}

export async function findCurrencies({ search, isActive, limit, offset }) {
    const where = buildCurrencyWhere({ search, isActive });

    const [currencies, total] = await Promise.all([
        prisma.currency.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: [
                { currency_code: "asc" },
                { id: "asc" }
            ]
        }),
        prisma.currency.count({ where })
    ]);

    return {
        currencies,
        total
    };
}

export async function findCurrencyById(id) {
    return prisma.currency.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function createCurrency(fields) {
    return prisma.currency.create({
        data: fieldsToData(fields)
    });
}

export async function updateCurrency(id, fields) {
    const currency = await findCurrencyById(id);

    if (!currency) {
        return null;
    }

    return prisma.currency.update({
        where: { id },
        data: fieldsToData(fields)
    });
}

export async function softDeleteCurrency(id) {
    const currency = await findCurrencyById(id);

    if (!currency) {
        return null;
    }

    return prisma.currency.update({
        where: { id },
        data: {
            is_delete: true,
            delete_at: new Date()
        }
    });
}

export async function findCurrencyOptions() {
    return prisma.currency.findMany({
        where: {
            is_delete: false,
            is_active: true
        },
        orderBy: [
            { currency_code: "asc" },
            { id: "asc" }
        ]
    });
}
