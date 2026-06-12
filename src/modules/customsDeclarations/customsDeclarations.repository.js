import { prisma } from "../../db/prisma.js";

const activeWhere = {
    is_delete: false
};

const declarationLineOrderBy = [
    { line_no: "asc" },
    { create_at: "asc" },
    { id: "asc" }
];

const declarationOrderBy = [
    { create_at: "desc" },
    { id: "desc" }
];

const declarationLineInclude = {
    shipment_line: true,
    purchase_order_line: true,
    item: true,
    item_customs_profile: true,
    currency: true
};

const declarationInclude = {
    shipment: true,
    broker: true,
    lines: {
        where: activeWhere,
        orderBy: declarationLineOrderBy,
        include: declarationLineInclude
    }
};

export async function findShipmentForCustoms(id, client = prisma) {
    return client.shipment.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: {
            lines: {
                where: activeWhere
            }
        }
    });
}

export async function findBrokerForCustoms(id, client = prisma) {
    return client.supplier.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function findCustomsDeclarationsByShipmentId(shipmentId) {
    return prisma.customsDeclaration.findMany({
        where: {
            shipment_id: shipmentId,
            is_delete: false
        },
        orderBy: declarationOrderBy,
        include: declarationInclude
    });
}

export async function findCustomsDeclarationById(id, client = prisma) {
    return client.customsDeclaration.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: declarationInclude
    });
}

export async function createCustomsDeclarationFromShipment(data) {
    const rows = await prisma.$queryRaw`
        SELECT fn_create_customs_declaration_from_shipment(
            ${data.shipment_id}::UUID,
            ${data.declaration_no ?? null}::VARCHAR,
            ${data.customs_type ?? "IMPORT"}::VARCHAR,
            ${data.customs_channel ?? null}::VARCHAR,
            ${data.broker_id ?? null}::UUID,
            ${data.note ?? null}::TEXT
        ) AS customs_declaration_id
    `;

    return findCustomsDeclarationById(rows[0]?.customs_declaration_id);
}

export async function updateCustomsDeclaration(id, data) {
    const declaration = await prisma.customsDeclaration.update({
        where: { id },
        data
    });

    return findCustomsDeclarationById(declaration.id);
}

export async function cancelCustomsDeclaration(id, { cancelledAt, cancelReason, note }) {
    const declaration = await prisma.customsDeclaration.update({
        where: { id },
        data: {
            status: "CANCELLED",
            cancelled_at: cancelledAt ?? new Date(),
            cancel_reason: cancelReason ?? null,
            note: note ?? undefined
        }
    });

    return findCustomsDeclarationById(declaration.id);
}

export async function openCustomsDraft(id, openedAt) {
    await prisma.$queryRaw`
        SELECT fn_open_customs_draft(
            ${id}::UUID,
            ${openedAt ?? new Date()}::TIMESTAMPTZ
        )
    `;

    return findCustomsDeclarationById(id);
}

export async function openCustomsOfficial(id, { declarationNo, customsChannel, openedAt }) {
    await prisma.$queryRaw`
        SELECT fn_open_customs_official(
            ${id}::UUID,
            ${declarationNo}::VARCHAR,
            ${customsChannel}::VARCHAR,
            ${openedAt ?? new Date()}::TIMESTAMPTZ
        )
    `;

    return findCustomsDeclarationById(id);
}

export async function clearCustomsDeclaration(id, { clearedAt, note }) {
    await prisma.$queryRaw`
        SELECT fn_clear_customs_declaration(
            ${id}::UUID,
            ${clearedAt ?? new Date()}::TIMESTAMPTZ,
            ${note ?? null}::TEXT
        )
    `;

    return findCustomsDeclarationById(id);
}

export async function findCustomsDeclarationLines(declarationId) {
    return prisma.customsDeclarationLine.findMany({
        where: {
            customs_declaration_id: declarationId,
            is_delete: false
        },
        orderBy: declarationLineOrderBy,
        include: declarationLineInclude
    });
}

export async function findCustomsDeclarationLineById(id, client = prisma) {
    return client.customsDeclarationLine.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: {
            customs_declaration: true,
            ...declarationLineInclude
        }
    });
}

export async function findShipmentLineForCustoms(id, client = prisma) {
    return client.shipmentLine.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function createCustomsDeclarationLine(declarationId, data) {
    const line = await prisma.customsDeclarationLine.create({
        data: {
            ...data,
            customs_declaration_id: declarationId
        }
    });

    return findCustomsDeclarationLineById(line.id);
}

export async function updateCustomsDeclarationLine(id, data) {
    const line = await prisma.customsDeclarationLine.update({
        where: { id },
        data
    });

    return findCustomsDeclarationLineById(line.id);
}

export async function softDeleteCustomsDeclarationLine(id) {
    const deletedAt = new Date();

    return prisma.customsDeclarationLine.update({
        where: { id },
        data: {
            is_delete: true,
            delete_at: deletedAt
        },
        include: {
            customs_declaration: true,
            ...declarationLineInclude
        }
    });
}
