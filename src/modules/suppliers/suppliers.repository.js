import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

const supplierRelations = {
    default_currency: true,
    default_incoterm: true,
    supplier_transport_modes: {
        where: {
            is_delete: false
        },
        include: {
            transport_mode: true
        },
        orderBy: [
            { is_default: "desc" },
            { create_at: "desc" },
            { id: "desc" }
        ]
    }
};

async function resolveDefaultCurrency(client, data) {
    if (Object.hasOwn(data, "default_currency_id")) {
        if (!data.default_currency_id) {
            data.default_currency_code = null;
            return;
        }

        const currency = await client.currency.findUnique({
            where: { id: data.default_currency_id }
        });

        if (currency) {
            data.default_currency_code = currency.currency_code;
        }

        return;
    }

    if (Object.hasOwn(data, "default_currency_code")) {
        if (!data.default_currency_code) {
            data.default_currency_id = null;
            return;
        }

        const currency = await client.currency.findUnique({
            where: { currency_code: data.default_currency_code }
        });

        if (currency) {
            data.default_currency_id = currency.id;
        }
    }
}

async function resolveDefaultIncoterm(client, data) {
    if (Object.hasOwn(data, "default_incoterm_id")) {
        if (!data.default_incoterm_id) {
            data.default_incoterm_code = null;
            return;
        }

        const incoterm = await client.incoterm.findUnique({
            where: { id: data.default_incoterm_id }
        });

        if (incoterm) {
            data.default_incoterm_code = incoterm.incoterm_code;
        }

        return;
    }

    if (Object.hasOwn(data, "default_incoterm_code")) {
        if (!data.default_incoterm_code) {
            data.default_incoterm_id = null;
            return;
        }

        const incoterm = await client.incoterm.findUnique({
            where: { incoterm_code: data.default_incoterm_code }
        });

        if (incoterm) {
            data.default_incoterm_id = incoterm.id;
        }
    }
}

async function buildSupplierData(client, fields) {
    const data = fieldsToData(fields);

    await Promise.all([
        resolveDefaultCurrency(client, data),
        resolveDefaultIncoterm(client, data)
    ]);

    return data;
}

async function findSupplierWithRelations(client, id) {
    return client.supplier.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: supplierRelations
    });
}

async function replaceSupplierTransportModes(client, supplierId, relationFields) {
    const relations = fieldsToData(relationFields);
    const hasTransportModeIds = Object.hasOwn(relations, "transport_mode_ids");
    const hasDefaultTransportModeId = Object.hasOwn(relations, "default_transport_mode_id");

    if (!hasTransportModeIds && !hasDefaultTransportModeId) {
        return;
    }

    const transportModeIds = hasTransportModeIds && Array.isArray(relations.transport_mode_ids)
        ? relations.transport_mode_ids
        : undefined;
    const defaultTransportModeId = relations.default_transport_mode_id || null;
    const nextTransportModeIds = [
        ...(transportModeIds || []),
        ...(defaultTransportModeId && !(transportModeIds || []).includes(defaultTransportModeId)
            ? [defaultTransportModeId]
            : [])
    ];

    await client.supplierTransportMode.updateMany({
        where: {
            supplier_id: supplierId,
            is_delete: false
        },
        data: {
            is_delete: true,
            delete_at: new Date()
        }
    });

    if (!nextTransportModeIds.length) {
        return;
    }

    await Promise.all(nextTransportModeIds.map((transportModeId) => (
        client.supplierTransportMode.upsert({
            where: {
                supplier_id_transport_mode_id: {
                    supplier_id: supplierId,
                    transport_mode_id: transportModeId
                }
            },
            create: {
                supplier_id: supplierId,
                transport_mode_id: transportModeId,
                is_default: defaultTransportModeId === transportModeId
            },
            update: {
                is_default: defaultTransportModeId === transportModeId,
                is_delete: false,
                delete_at: null
            }
        })
    )));
}

function buildSupplierWhere({ search, role, country, isActive }) {
    const where = {
        is_delete: false
    };

    if (role) {
        where.supplier_roles = {
            has: role
        };
    }

    if (country) {
        where.country = {
            contains: country,
            mode: "insensitive"
        };
    }

    if (isActive !== undefined) {
        where.is_active = isActive;
    }

    if (search) {
        where.OR = [
            "supplier_code",
            "supplier_name",
            "country",
            "address",
            "contact_name",
            "contact_email",
            "contact_phone",
            "payment_term",
            "default_currency_code",
            "default_incoterm_code"
        ].map((column) => ({
            [column]: {
                contains: search,
                mode: "insensitive"
            }
        }));
    }

    return where;
}

export async function findSuppliers({ search, role, country, isActive, limit, offset }) {
    const where = buildSupplierWhere({ search, role, country, isActive });

    const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
            where,
            take: limit,
            skip: offset,
            include: supplierRelations,
            orderBy: [
                { supplier_name: "asc" },
                { id: "asc" }
            ]
        }),
        prisma.supplier.count({ where })
    ]);

    return {
        suppliers,
        total
    };
}

export async function findSupplierById(id) {
    return findSupplierWithRelations(prisma, id);
}

export async function createSupplier(fields, relationFields = []) {
    return prisma.$transaction(async (tx) => {
        const supplier = await tx.supplier.create({
            data: await buildSupplierData(tx, fields)
        });

        await replaceSupplierTransportModes(tx, supplier.id, relationFields);

        return findSupplierWithRelations(tx, supplier.id);
    });
}

export async function updateSupplier(id, fields, relationFields = []) {
    return prisma.$transaction(async (tx) => {
        const supplier = await findSupplierWithRelations(tx, id);

        if (!supplier) {
            return null;
        }

        await tx.supplier.update({
            where: { id },
            data: await buildSupplierData(tx, fields)
        });

        await replaceSupplierTransportModes(tx, id, relationFields);

        return findSupplierWithRelations(tx, id);
    });
}

export async function softDeleteSupplier(id) {
    return prisma.$transaction(async (tx) => {
        const supplier = await findSupplierWithRelations(tx, id);

        if (!supplier) {
            return null;
        }

        const deletedSupplier = await tx.supplier.update({
            where: { id },
            data: {
                is_delete: true,
                delete_at: new Date()
            },
            include: supplierRelations
        });

        await tx.supplierTransportMode.updateMany({
            where: {
                supplier_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: new Date()
            }
        });

        return deletedSupplier;
    });
}

export async function findSupplierOptions({ role }) {
    const where = {
        is_delete: false,
        is_active: true
    };

    if (role) {
        where.supplier_roles = {
            has: role
        };
    }

    return prisma.supplier.findMany({
        where,
        orderBy: [
            { supplier_name: "asc" },
            { id: "asc" }
        ]
    });
}
