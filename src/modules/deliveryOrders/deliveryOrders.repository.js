import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

const activeWhere = {
    is_delete: false
};

const deliveryOrderLineInclude = {
    purchase_order_line: {
        include: {
            item: true
        }
    },
    item: true
};

const deliveryOrderLotInclude = {
    po_lot: {
        include: {
            delivery_slot: true
        }
    },
    lines: {
        where: activeWhere,
        orderBy: [
            { create_at: "asc" },
            { id: "asc" }
        ],
        include: deliveryOrderLineInclude
    }
};

const deliveryOrderInclude = {
    purchase_order: {
        include: {
            supplier: true
        }
    },
    transport_mode: true,
    lots: {
        where: activeWhere,
        orderBy: [
            { create_at: "asc" },
            { lot_no: "asc" }
        ],
        include: deliveryOrderLotInclude
    },
    lines: {
        where: activeWhere,
        orderBy: [
            { create_at: "asc" },
            { id: "asc" }
        ],
        include: deliveryOrderLineInclude
    }
};

function buildDeliveryOrderWhere({ search, status, purchaseOrderId, transportModeId }) {
    const where = {
        is_delete: false
    };

    if (status) {
        where.status = status;
    }

    if (purchaseOrderId) {
        where.purchase_order_id = purchaseOrderId;
    }

    if (transportModeId) {
        where.transport_mode_id = transportModeId;
    }

    if (search) {
        where.OR = [
            "do_no",
            "origin_address",
            "destination_address",
            "warehouse_name",
            "requested_by",
            "handled_by",
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

export async function findDeliveryOrders({ search, status, purchaseOrderId, transportModeId, limit, offset }) {
    const where = buildDeliveryOrderWhere({ search, status, purchaseOrderId, transportModeId });

    const [deliveryOrders, total] = await Promise.all([
        prisma.deliveryOrder.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: [
                { create_at: "desc" },
                { do_no: "asc" }
            ],
            include: {
                purchase_order: {
                    include: {
                        supplier: true
                    }
                },
                transport_mode: true,
                lots: {
                    where: activeWhere
                },
                lines: {
                    where: activeWhere
                }
            }
        }),
        prisma.deliveryOrder.count({ where })
    ]);

    return {
        deliveryOrders,
        total
    };
}

export async function findDeliveryOrderById(id, client = prisma) {
    return client.deliveryOrder.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: deliveryOrderInclude
    });
}

export async function findPurchaseOrderForDeliveryOrder(id, client = prisma) {
    return client.purchaseOrder.findFirst({
        where: {
            id,
            is_delete: false
        }
    });
}

export async function findDeliveryOrdersByPurchaseOrderId(purchaseOrderId) {
    return prisma.deliveryOrder.findMany({
        where: {
            purchase_order_id: purchaseOrderId,
            is_delete: false
        },
        orderBy: [
            { create_at: "desc" },
            { do_no: "asc" }
        ],
        include: {
            transport_mode: true,
            lots: {
                where: activeWhere
            },
            lines: {
                where: activeWhere
            }
        }
    });
}

export async function findDeliveryOrderLots(deliveryOrderId) {
    return prisma.deliveryOrderLot.findMany({
        where: {
            delivery_order_id: deliveryOrderId,
            is_delete: false
        },
        orderBy: [
            { create_at: "asc" },
            { lot_no: "asc" }
        ],
        include: deliveryOrderLotInclude
    });
}

export async function findDeliveryOrderLines(deliveryOrderId) {
    return prisma.deliveryOrderLine.findMany({
        where: {
            delivery_order_id: deliveryOrderId,
            is_delete: false
        },
        orderBy: [
            { create_at: "asc" },
            { id: "asc" }
        ],
        include: deliveryOrderLineInclude
    });
}

export async function findPoLotsByIds(lotIds) {
    return prisma.poLot.findMany({
        where: {
            id: {
                in: lotIds
            },
            is_delete: false
        },
        include: {
            delivery_slot: true,
            lot_lines: {
                where: activeWhere,
                orderBy: [
                    { create_at: "asc" },
                    { id: "asc" }
                ],
                include: {
                    purchase_order_line: true,
                    item: true
                }
            }
        }
    });
}

export async function findActiveDeliveryOrderLotsByPoLotIds(lotIds) {
    return prisma.deliveryOrderLot.findMany({
        where: {
            po_lot_id: {
                in: lotIds
            },
            is_delete: false
        },
        include: {
            delivery_order: true
        }
    });
}

export async function createDeliveryOrder(fields) {
    const deliveryOrder = await prisma.deliveryOrder.create({
        data: fieldsToData(fields)
    });

    return findDeliveryOrderById(deliveryOrder.id);
}

export async function updateDeliveryOrder(id, fields) {
    const deliveryOrder = await prisma.deliveryOrder.update({
        where: { id },
        data: fieldsToData(fields)
    });

    return findDeliveryOrderById(deliveryOrder.id);
}

export async function createDeliveryOrderFromLots(fields, lots) {
    return prisma.$transaction(async (tx) => {
        const deliveryOrder = await tx.deliveryOrder.create({
            data: fieldsToData(fields)
        });

        for (const lot of lots) {
            const deliveryOrderLot = await tx.deliveryOrderLot.create({
                data: {
                    delivery_order_id: deliveryOrder.id,
                    po_lot_id: lot.id,
                    lot_no: lot.lot_no,
                    lot_name: lot.lot_name,
                    planned_cargo_ready_date: lot.planned_cargo_ready_date,
                    planned_etd: lot.planned_etd,
                    planned_eta: lot.planned_eta,
                    notes: lot.notes
                }
            });

            for (const lotLine of lot.lot_lines) {
                await tx.deliveryOrderLine.create({
                    data: {
                        delivery_order_id: deliveryOrder.id,
                        delivery_order_lot_id: deliveryOrderLot.id,
                        purchase_order_line_id: lotLine.purchase_order_line_id,
                        item_id: lotLine.item_id,
                        item_description: lotLine.purchase_order_line.item_description,
                        qty: lotLine.qty_lotted,
                        unit: lotLine.unit || lotLine.purchase_order_line.unit,
                        notes: lotLine.notes
                    }
                });
            }
        }

        return findDeliveryOrderById(deliveryOrder.id, tx);
    });
}

export async function softDeleteDeliveryOrder(id) {
    return prisma.$transaction(async (tx) => {
        const deletedAt = new Date();

        await tx.deliveryOrderLine.updateMany({
            where: {
                delivery_order_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        await tx.deliveryOrderLot.updateMany({
            where: {
                delivery_order_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        return tx.deliveryOrder.update({
            where: { id },
            data: {
                is_delete: true,
                delete_at: deletedAt
            },
            include: deliveryOrderInclude
        });
    });
}

export async function updateDeliveryOrderStatus(id, status) {
    return prisma.$transaction(async (tx) => {
        await tx.deliveryOrder.update({
            where: { id },
            data: { status }
        });

        if (status === "ASSIGNED_TO_SHIPMENT") {
            const links = await tx.deliveryOrderLot.findMany({
                where: {
                    delivery_order_id: id,
                    is_delete: false
                }
            });

            await tx.poLot.updateMany({
                where: {
                    id: {
                        in: links.map((link) => link.po_lot_id)
                    },
                    is_delete: false
                },
                data: {
                    status: "ASSIGNED_TO_SHIPMENT"
                }
            });
        }

        return findDeliveryOrderById(id, tx);
    });
}

export async function cancelDeliveryOrderWithLinks(id) {
    return prisma.$transaction(async (tx) => {
        const deletedAt = new Date();

        await tx.deliveryOrderLine.updateMany({
            where: {
                delivery_order_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        await tx.deliveryOrderLot.updateMany({
            where: {
                delivery_order_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        await tx.deliveryOrder.update({
            where: { id },
            data: {
                status: "CANCELLED"
            }
        });

        return findDeliveryOrderById(id, tx);
    });
}
