import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

const activeWhere = {
    is_delete: false
};

const quotationChargeLineOrderBy = [
    { line_no: "asc" },
    { create_at: "asc" },
    { id: "asc" }
];

const quotationEventOrderBy = [
    { event_at: "desc" },
    { create_at: "desc" },
    { id: "desc" }
];

const quotationInclude = {
    supplier: true,
    currency: true,
    charge_lines: {
        where: activeWhere,
        orderBy: quotationChargeLineOrderBy
    },
    events: {
        where: activeWhere,
        orderBy: quotationEventOrderBy
    }
};

function buildQuotationWhere({
    search,
    refType,
    refId,
    status,
    supplierId,
    fromDate,
    toDate
}) {
    const where = {
        is_delete: false
    };

    if (refType) {
        where.ref_type = refType;
    }

    if (refId) {
        where.ref_id = refId;
    }

    if (status) {
        where.status = status;
    }

    if (supplierId) {
        where.supplier_id = supplierId;
    }

    if (fromDate || toDate) {
        where.create_at = {};

        if (fromDate) {
            where.create_at.gte = fromDate;
        }

        if (toDate) {
            where.create_at.lte = toDate;
        }
    }

    if (search) {
        where.OR = [
            "quotation_no",
            "quotation_type",
            "status",
            "note"
        ].map((column) => ({
            [column]: {
                contains: search,
                mode: "insensitive"
            }
        }));
    }

    return where;
}

export async function findQuotations(filters) {
    const where = buildQuotationWhere(filters);

    const [quotations, total] = await Promise.all([
        prisma.quotation.findMany({
            where,
            take: filters.limit,
            skip: filters.offset,
            orderBy: [
                { create_at: "desc" },
                { quotation_no: "asc" },
                { version: "desc" }
            ],
            include: {
                supplier: true,
                currency: true,
                charge_lines: {
                    where: activeWhere
                }
            }
        }),
        prisma.quotation.count({ where })
    ]);

    return {
        quotations,
        total
    };
}

export async function findQuotationById(id, client = prisma) {
    return client.quotation.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: quotationInclude
    });
}

export async function findDeliveryOrderForQuotation(id, client = prisma) {
    return client.deliveryOrder.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function findSupplierForQuotation(id, client = prisma) {
    return client.supplier.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function findCurrencyForQuotation(id, client = prisma) {
    return client.currency.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function createQuotation(fields, chargeLines = []) {
    return prisma.$transaction(async (tx) => {
        const quotation = await tx.quotation.create({
            data: fieldsToData(fields)
        });

        for (const chargeLine of chargeLines) {
            await tx.quotationChargeLine.create({
                data: {
                    ...chargeLine,
                    quotation_id: quotation.id
                }
            });
        }

        return findQuotationById(quotation.id, tx);
    });
}

export async function updateQuotation(id, fields) {
    const quotation = await prisma.quotation.update({
        where: { id },
        data: fieldsToData(fields)
    });

    return findQuotationById(quotation.id);
}

export async function softDeleteQuotation(id) {
    return prisma.$transaction(async (tx) => {
        const deletedAt = new Date();

        await tx.quotationChargeLine.updateMany({
            where: {
                quotation_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        return tx.quotation.update({
            where: { id },
            data: {
                is_delete: true,
                delete_at: deletedAt
            },
            include: quotationInclude
        });
    });
}

export async function updateQuotationStatus(id, data) {
    const quotation = await prisma.quotation.update({
        where: { id },
        data
    });

    return findQuotationById(quotation.id);
}

export async function findQuotationsByDeliveryOrderId(deliveryOrderId) {
    return prisma.quotation.findMany({
        where: {
            ref_type: "DELIVERY_ORDER",
            ref_id: deliveryOrderId,
            is_delete: false
        },
        orderBy: [
            { quotation_group_id: "asc" },
            { version: "desc" },
            { create_at: "desc" }
        ],
        include: {
            supplier: true,
            currency: true,
            charge_lines: {
                where: activeWhere,
                orderBy: quotationChargeLineOrderBy
            }
        }
    });
}

export async function findQuotationVersions(quotationGroupId) {
    return prisma.quotation.findMany({
        where: {
            quotation_group_id: quotationGroupId,
            is_delete: false
        },
        orderBy: [
            { version: "desc" },
            { create_at: "desc" }
        ],
        include: {
            supplier: true,
            currency: true,
            charge_lines: {
                where: activeWhere,
                orderBy: quotationChargeLineOrderBy
            }
        }
    });
}

export async function createQuotationVersion(sourceQuotationId, { newQuotationNo, actorName, note }) {
    const rows = await prisma.$queryRaw`
        SELECT fn_create_quotation_version(
            ${sourceQuotationId}::UUID,
            ${newQuotationNo}::VARCHAR,
            ${actorName}::VARCHAR,
            ${note}::TEXT
        ) AS new_quotation_id
    `;
    const newQuotationId = rows[0]?.new_quotation_id;

    return findQuotationById(newQuotationId);
}

export async function markQuotationFinal(id, { actorName, note }) {
    await prisma.$queryRaw`
        SELECT fn_mark_quotation_final(
            ${id}::UUID,
            ${actorName}::VARCHAR,
            ${note}::TEXT
        )
    `;

    return findQuotationById(id);
}

export async function findChargeLinesByQuotationId(quotationId) {
    return prisma.quotationChargeLine.findMany({
        where: {
            quotation_id: quotationId,
            is_delete: false
        },
        orderBy: quotationChargeLineOrderBy
    });
}

export async function findChargeLineById(id, client = prisma) {
    return client.quotationChargeLine.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: {
            quotation: true
        }
    });
}

export async function createQuotationChargeLine(quotationId, data) {
    const chargeLine = await prisma.quotationChargeLine.create({
        data: {
            ...data,
            quotation_id: quotationId
        }
    });

    return findChargeLineById(chargeLine.id);
}

export async function updateQuotationChargeLine(id, data) {
    const chargeLine = await prisma.quotationChargeLine.update({
        where: { id },
        data
    });

    return findChargeLineById(chargeLine.id);
}

export async function softDeleteQuotationChargeLine(id) {
    const deletedAt = new Date();
    return prisma.quotationChargeLine.update({
        where: { id },
        data: {
            is_delete: true,
            delete_at: deletedAt
        },
        include: {
            quotation: true
        }
    });
}

export async function findEventsByQuotationId(quotationId) {
    return prisma.quotationEvent.findMany({
        where: {
            quotation_id: quotationId,
            is_delete: false
        },
        orderBy: quotationEventOrderBy
    });
}
