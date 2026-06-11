import { prisma } from "../../db/prisma.js";

const activeWhere = {
    is_delete: false
};

const shipmentLineOrderBy = [
    { lot_no: "asc" },
    { create_at: "asc" },
    { id: "asc" }
];

const shipmentMilestoneOrderBy = [
    { sequence_no: "asc" },
    { create_at: "asc" },
    { id: "asc" }
];

const shipmentDocumentOrderBy = [
    { create_at: "desc" },
    { id: "desc" }
];

const shipmentInclude = {
    delivery_order: true,
    purchase_order: true,
    final_quotation: true,
    transport_mode: true,
    forwarder: true,
    lines: {
        where: activeWhere,
        orderBy: shipmentLineOrderBy,
        include: {
            item: true,
            purchase_order_line: true,
            delivery_order_line: true
        }
    },
    milestones: {
        where: activeWhere,
        orderBy: shipmentMilestoneOrderBy
    },
    documents: {
        where: activeWhere,
        orderBy: shipmentDocumentOrderBy,
        include: {
            milestone: true
        }
    }
};

function buildShipmentWhere({
    search,
    status,
    mode,
    deliveryOrderId,
    purchaseOrderId,
    forwarderId,
    transportModeId,
    fromDate,
    toDate
}) {
    const where = {
        is_delete: false
    };

    if (status) {
        where.status = status;
    }

    if (mode) {
        where.mode = mode;
    }

    if (deliveryOrderId) {
        where.delivery_order_id = deliveryOrderId;
    }

    if (purchaseOrderId) {
        where.purchase_order_id = purchaseOrderId;
    }

    if (forwarderId) {
        where.forwarder_id = forwarderId;
    }

    if (transportModeId) {
        where.transport_mode_id = transportModeId;
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
            "shipment_no",
            "carrier",
            "mode",
            "status",
            "vessel_flight",
            "voyage_no",
            "bl_awb_no",
            "pol",
            "pod",
            "notes"
        ].map((column) => ({
            [column]: {
                contains: search,
                mode: "insensitive"
            }
        }));
    }

    return where;
}

export async function findShipments(filters) {
    const where = buildShipmentWhere(filters);

    const [shipments, total] = await Promise.all([
        prisma.shipment.findMany({
            where,
            take: filters.limit,
            skip: filters.offset,
            orderBy: [
                { create_at: "desc" },
                { shipment_no: "asc" }
            ],
            include: {
                delivery_order: true,
                purchase_order: true,
                final_quotation: true,
                transport_mode: true,
                forwarder: true,
                milestones: {
                    where: activeWhere,
                    orderBy: shipmentMilestoneOrderBy
                }
            }
        }),
        prisma.shipment.count({ where })
    ]);

    return {
        shipments,
        total
    };
}

export async function findShipmentById(id, client = prisma) {
    return client.shipment.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: shipmentInclude
    });
}

export async function findDeliveryOrderForShipment(id, client = prisma) {
    return client.deliveryOrder.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: {
            lines: {
                where: activeWhere
            },
            shipments: {
                where: activeWhere
            }
        }
    });
}

export async function findQuotationForShipment(id, client = prisma) {
    return client.quotation.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function findFinalQuotationForDeliveryOrder(deliveryOrderId, client = prisma) {
    return client.quotation.findFirst({
        where: {
            ref_type: "DELIVERY_ORDER",
            ref_id: deliveryOrderId,
            status: "CONFIRMED_BY_KBI",
            is_final: true,
            is_delete: false
        },
        orderBy: [
            { confirmed_at: "desc" },
            { update_at: "desc" }
        ]
    });
}

export async function findSupplierForShipment(id, client = prisma) {
    return client.supplier.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function findTransportModeForShipment(id, client = prisma) {
    return client.transportMode.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function createShipmentFromDeliveryOrder(data) {
    const containerNo = data.container_no === undefined || data.container_no === null
        ? null
        : JSON.stringify(data.container_no);

    const rows = await prisma.$queryRaw`
        SELECT fn_create_shipment_from_delivery_order(
            ${data.shipment_no}::VARCHAR,
            ${data.delivery_order_id}::UUID,
            ${data.final_quotation_id ?? null}::UUID,
            ${data.transport_mode_id ?? null}::UUID,
            ${data.forwarder_id ?? null}::UUID,
            ${data.carrier ?? null}::VARCHAR,
            ${data.mode ?? "SEA"}::VARCHAR,
            ${data.vessel_flight ?? null}::VARCHAR,
            ${data.voyage_no ?? null}::VARCHAR,
            ${data.bl_awb_no ?? null}::VARCHAR,
            ${containerNo}::JSONB,
            ${data.pol ?? null}::VARCHAR,
            ${data.pod ?? null}::VARCHAR,
            ${data.etd ?? null}::DATE,
            ${data.eta ?? null}::DATE,
            ${data.notes ?? null}::TEXT
        ) AS shipment_id
    `;

    return findShipmentById(rows[0]?.shipment_id);
}

export async function updateShipment(id, data) {
    const shipment = await prisma.shipment.update({
        where: { id },
        data
    });

    return findShipmentById(shipment.id);
}

export async function cancelShipment(id, notes) {
    const data = {
        status: "CANCELLED"
    };

    if (notes !== undefined) {
        data.notes = notes;
    }

    const shipment = await prisma.shipment.update({
        where: { id },
        data
    });

    return findShipmentById(shipment.id);
}

export async function findShipmentLines(shipmentId) {
    return prisma.shipmentLine.findMany({
        where: {
            shipment_id: shipmentId,
            is_delete: false
        },
        orderBy: shipmentLineOrderBy,
        include: {
            item: true,
            purchase_order_line: true,
            delivery_order_line: true
        }
    });
}

export async function findShipmentMilestones(shipmentId) {
    return prisma.shipmentMilestone.findMany({
        where: {
            shipment_id: shipmentId,
            is_delete: false
        },
        orderBy: shipmentMilestoneOrderBy
    });
}

export async function findShipmentMilestoneById(id, client = prisma) {
    return client.shipmentMilestone.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function findShipmentMilestoneByCode(shipmentId, milestoneCode, client = prisma) {
    return client.shipmentMilestone.findFirst({
        where: {
            shipment_id: shipmentId,
            milestone_code: milestoneCode,
            is_delete: false
        }
    });
}

export async function markShipmentMilestoneDone(shipmentId, milestoneCode, { actualAt, notes }) {
    await prisma.$queryRaw`
        SELECT fn_mark_shipment_milestone_done(
            ${shipmentId}::UUID,
            ${milestoneCode}::VARCHAR,
            ${actualAt ?? new Date()}::TIMESTAMPTZ,
            ${notes ?? null}::TEXT
        )
    `;

    return findShipmentById(shipmentId);
}

export async function findShipmentDocuments(shipmentId) {
    return prisma.shipmentDocument.findMany({
        where: {
            shipment_id: shipmentId,
            is_delete: false
        },
        orderBy: shipmentDocumentOrderBy,
        include: {
            milestone: true
        }
    });
}

export async function findShipmentDocumentById(id, client = prisma) {
    return client.shipmentDocument.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: {
            shipment: true,
            milestone: true
        }
    });
}

export async function createShipmentDocument(shipmentId, data) {
    const document = await prisma.shipmentDocument.create({
        data: {
            ...data,
            shipment_id: shipmentId
        }
    });

    return findShipmentDocumentById(document.id);
}

export async function updateShipmentDocument(id, data) {
    const document = await prisma.shipmentDocument.update({
        where: { id },
        data
    });

    return findShipmentDocumentById(document.id);
}

export async function softDeleteShipmentDocument(id) {
    const deletedAt = new Date();

    return prisma.shipmentDocument.update({
        where: { id },
        data: {
            is_delete: true,
            delete_at: deletedAt
        },
        include: {
            shipment: true,
            milestone: true
        }
    });
}
