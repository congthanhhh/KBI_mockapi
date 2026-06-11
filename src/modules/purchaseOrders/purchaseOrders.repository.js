import { prisma } from "../../db/prisma.js";

function fieldsToData(fields) {
    return Object.fromEntries(fields);
}

function deletedUniqueValue(value, id) {
    const suffix = `__deleted__${id.slice(0, 8)}`;

    return `${String(value).slice(0, 50 - suffix.length)}${suffix}`;
}

const activeWhere = {
    is_delete: false
};

const lineInclude = {
    item: true,
    item_customs_profile: true
};

const lotLineInclude = {
    purchase_order_line: {
        include: lineInclude
    },
    item: true
};

const purchaseOrderInclude = {
    supplier: true,
    currency: true,
    incoterm: true,
    transport_mode: true,
    lines: {
        where: activeWhere,
        orderBy: [
            { line_no: "asc" },
            { id: "asc" }
        ],
        include: lineInclude
    },
    confirmations: {
        where: activeWhere,
        orderBy: { confirmed_at: "desc" },
        include: {
            lines: {
                where: activeWhere,
                include: {
                    purchase_order_line: true
                }
            }
        }
    },
    delivery_slots: {
        where: activeWhere,
        orderBy: [
            { sort_order: "asc" },
            { slot_no: "asc" }
        ],
        include: {
            lots: {
                where: activeWhere,
                orderBy: [
                    { sort_order: "asc" },
                    { lot_no: "asc" }
                ],
                include: {
                    lot_lines: {
                        where: activeWhere,
                        orderBy: { create_at: "asc" },
                        include: lotLineInclude
                    }
                }
            }
        }
    }
};

function buildPurchaseOrderWhere({ search, status, supplierId }) {
    const where = {
        is_delete: false
    };

    if (status) {
        where.status = status;
    }

    if (supplierId) {
        where.supplier_id = supplierId;
    }

    if (search) {
        where.OR = [
            "po_no",
            "contract_no",
            "po_type",
            "payment_term",
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

export async function findPurchaseOrders({ search, status, supplierId, limit, offset }) {
    const where = buildPurchaseOrderWhere({ search, status, supplierId });

    const [purchaseOrders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: [
                { create_at: "desc" },
                { po_no: "asc" }
            ],
            include: {
                supplier: true,
                currency: true,
                incoterm: true,
                transport_mode: true
            }
        }),
        prisma.purchaseOrder.count({ where })
    ]);

    return {
        purchaseOrders,
        total
    };
}

export async function findPurchaseOrderById(id, client = prisma) {
    return client.purchaseOrder.findFirst({
        where: {
            id,
            is_delete: false
        },
        include: purchaseOrderInclude
    });
}

export async function createPurchaseOrderWithDefaults(fields, lineFields) {
    return prisma.$transaction(async (tx) => {
        const purchaseOrder = await tx.purchaseOrder.create({
            data: fieldsToData(fields)
        });

        const deliverySlot = await tx.poDeliverySlot.create({
            data: {
                purchase_order_id: purchaseOrder.id,
                slot_no: "SLOT-001",
                slot_name: "Default Slot",
                status: "PLANNED",
                sort_order: 1
            }
        });

        const lot = await tx.poLot.create({
            data: {
                purchase_order_id: purchaseOrder.id,
                delivery_slot_id: deliverySlot.id,
                lot_no: "LOT-001",
                lot_name: "Default LOT",
                status: "PLANNED",
                sort_order: 1
            }
        });

        for (const lineData of lineFields) {
            const purchaseOrderLine = await tx.purchaseOrderLine.create({
                data: {
                    ...lineData,
                    purchase_order_id: purchaseOrder.id,
                    qty_lotted: lineData.qty_ordered
                }
            });

            await tx.poLotLine.create({
                data: {
                    po_lot_id: lot.id,
                    purchase_order_line_id: purchaseOrderLine.id,
                    item_id: purchaseOrderLine.item_id,
                    qty_lotted: purchaseOrderLine.qty_ordered,
                    unit: purchaseOrderLine.unit
                }
            });
        }

        return findPurchaseOrderById(purchaseOrder.id, tx);
    });
}

export async function updatePurchaseOrder(id, fields) {
    return prisma.purchaseOrder.update({
        where: { id },
        data: fieldsToData(fields),
        include: purchaseOrderInclude
    });
}

export async function updatePurchaseOrderState(id, data) {
    return prisma.purchaseOrder.update({
        where: { id },
        data,
        include: purchaseOrderInclude
    });
}

export async function softDeletePurchaseOrder(id) {
    return prisma.$transaction(async (tx) => {
        const deletedAt = new Date();

        await tx.poLotLine.updateMany({
            where: {
                po_lot: {
                    is: {
                        purchase_order_id: id
                    }
                },
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });
        await tx.poLot.updateMany({
            where: {
                purchase_order_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });
        await tx.poDeliverySlot.updateMany({
            where: {
                purchase_order_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });
        await tx.purchaseOrderConfirmationLine.updateMany({
            where: {
                confirmation: {
                    is: {
                        purchase_order_id: id
                    }
                },
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });
        await tx.purchaseOrderConfirmation.updateMany({
            where: {
                purchase_order_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });
        await tx.purchaseOrderLine.updateMany({
            where: {
                purchase_order_id: id,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        return tx.purchaseOrder.update({
            where: { id },
            data: {
                is_delete: true,
                delete_at: deletedAt
            },
            include: purchaseOrderInclude
        });
    });
}

export async function findPurchaseOrderLines(purchaseOrderId) {
    return prisma.purchaseOrderLine.findMany({
        where: {
            purchase_order_id: purchaseOrderId,
            is_delete: false
        },
        orderBy: [
            { line_no: "asc" },
            { id: "asc" }
        ],
        include: lineInclude
    });
}

export async function findPurchaseOrderLineById(lineId, client = prisma) {
    return client.purchaseOrderLine.findFirst({
        where: {
            id: lineId,
            is_delete: false
        },
        include: lineInclude
    });
}

export async function createPurchaseOrderLineWithDefaultLot(purchaseOrderId, data) {
    return prisma.$transaction(async (tx) => {
        const line = await tx.purchaseOrderLine.create({
            data: {
                ...data,
                purchase_order_id: purchaseOrderId,
                qty_lotted: data.qty_ordered
            },
            include: lineInclude
        });

        const defaultLot = await tx.poLot.findFirst({
            where: {
                purchase_order_id: purchaseOrderId,
                lot_no: "LOT-001",
                is_delete: false
            }
        });

        if (defaultLot) {
            await tx.poLotLine.create({
                data: {
                    po_lot_id: defaultLot.id,
                    purchase_order_line_id: line.id,
                    item_id: line.item_id,
                    qty_lotted: line.qty_ordered,
                    unit: line.unit
                }
            });
        }

        return findPurchaseOrderLineById(line.id, tx);
    });
}

export async function updatePurchaseOrderLine(lineId, fields) {
    return prisma.purchaseOrderLine.update({
        where: { id: lineId },
        data: fieldsToData(fields),
        include: lineInclude
    });
}

export async function softDeletePurchaseOrderLine(lineId) {
    return prisma.$transaction(async (tx) => {
        const deletedAt = new Date();

        await tx.poLotLine.updateMany({
            where: {
                purchase_order_line_id: lineId,
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        return tx.purchaseOrderLine.update({
            where: { id: lineId },
            data: {
                qty_lotted: 0,
                is_delete: true,
                delete_at: deletedAt
            },
            include: lineInclude
        });
    });
}

export async function sumActiveLotQtyByLine(lineId) {
    const result = await prisma.poLotLine.aggregate({
        where: {
            purchase_order_line_id: lineId,
            is_delete: false
        },
        _sum: {
            qty_lotted: true
        }
    });

    return result._sum.qty_lotted || 0;
}

export async function createPurchaseOrderConfirmation(purchaseOrderId, headerData, lineData) {
    return prisma.$transaction(async (tx) => {
        const confirmation = await tx.purchaseOrderConfirmation.create({
            data: {
                ...headerData,
                purchase_order_id: purchaseOrderId,
                lines: {
                    create: lineData
                }
            },
            include: {
                lines: {
                    include: {
                        purchase_order_line: true
                    }
                }
            }
        });

        for (const line of lineData) {
            const sumResult = await tx.purchaseOrderConfirmationLine.aggregate({
                where: {
                    purchase_order_line_id: line.purchase_order_line_id,
                    is_delete: false
                },
                _sum: {
                    confirmed_qty: true
                }
            });

            await tx.purchaseOrderLine.update({
                where: { id: line.purchase_order_line_id },
                data: {
                    qty_confirmed: sumResult._sum.confirmed_qty || 0
                }
            });
        }

        await tx.purchaseOrder.update({
            where: { id: purchaseOrderId },
            data: {
                status: "CONFIRMED",
                confirmed_at: headerData.confirmed_at || new Date()
            }
        });

        return confirmation;
    });
}

export async function createDeliverySlot(purchaseOrderId, fields) {
    return prisma.$transaction(async (tx) => {
        const data = fieldsToData(fields);

        await releaseDeletedSlotNo(tx, purchaseOrderId, data.slot_no);

        return tx.poDeliverySlot.create({
            data: {
                ...data,
                purchase_order_id: purchaseOrderId
            }
        });
    });
}

export async function updateDeliverySlot(slotId, fields) {
    return prisma.$transaction(async (tx) => {
        const data = fieldsToData(fields);
        const deliverySlot = await findDeliverySlotById(slotId, tx);

        if (data.slot_no && data.slot_no !== deliverySlot.slot_no) {
            await releaseDeletedSlotNo(tx, deliverySlot.purchase_order_id, data.slot_no);
        }

        return tx.poDeliverySlot.update({
            where: { id: slotId },
            data,
            include: {
                lots: {
                    where: activeWhere,
                    orderBy: [
                        { sort_order: "asc" },
                        { lot_no: "asc" }
                    ]
                }
            }
        });
    });
}

export async function countActiveLotsByDeliverySlot(slotId) {
    return prisma.poLot.count({
        where: {
            delivery_slot_id: slotId,
            is_delete: false
        }
    });
}

export async function softDeleteDeliverySlot(slotId) {
    return prisma.$transaction(async (tx) => {
        const deliverySlot = await findDeliverySlotById(slotId, tx);

        return tx.poDeliverySlot.update({
            where: { id: slotId },
            data: {
                slot_no: deletedUniqueValue(deliverySlot.slot_no, deliverySlot.id),
                is_delete: true,
                delete_at: new Date()
            }
        });
    });
}

export async function findDeliverySlotById(slotId, client = prisma) {
    return client.poDeliverySlot.findFirst({
        where: {
            id: slotId,
            is_delete: false
        }
    });
}

export async function findActiveDeliverySlotByNo(purchaseOrderId, slotNo, excludeSlotId = null) {
    return prisma.poDeliverySlot.findFirst({
        where: {
            purchase_order_id: purchaseOrderId,
            slot_no: slotNo,
            is_delete: false,
            ...(excludeSlotId ? { id: { not: excludeSlotId } } : {})
        }
    });
}

export async function findLotPlanning(purchaseOrderId, client = prisma) {
    return client.purchaseOrder.findFirst({
        where: {
            id: purchaseOrderId,
            is_delete: false
        },
        include: {
            lines: {
                where: activeWhere,
                orderBy: [
                    { line_no: "asc" },
                    { id: "asc" }
                ],
                include: lineInclude
            },
            delivery_slots: {
                where: activeWhere,
                orderBy: [
                    { sort_order: "asc" },
                    { slot_no: "asc" }
                ],
                include: {
                    lots: {
                        where: activeWhere,
                        orderBy: [
                            { sort_order: "asc" },
                            { lot_no: "asc" }
                        ],
                        include: {
                            lot_lines: {
                                where: activeWhere,
                                orderBy: { create_at: "asc" },
                                include: lotLineInclude
                            }
                        }
                    }
                }
            }
        }
    });
}

export async function createEmptyLot(data) {
    return prisma.$transaction(async (tx) => {
        await releaseDeletedLotNo(tx, data.purchase_order_id, data.lot_no);

        return tx.poLot.create({
            data,
            include: {
                delivery_slot: true,
                lot_lines: {
                    where: activeWhere,
                    include: lotLineInclude
                }
            }
        });
    });
}

export async function updateLot(lotId, fields) {
    return prisma.$transaction(async (tx) => {
        const data = fieldsToData(fields);
        const lot = await findLotById(lotId, tx);

        if (data.lot_no && data.lot_no !== lot.lot_no) {
            await releaseDeletedLotNo(tx, lot.purchase_order_id, data.lot_no);
        }

        return tx.poLot.update({
            where: { id: lotId },
            data,
            include: {
                delivery_slot: true,
                lot_lines: {
                    where: activeWhere,
                    include: lotLineInclude
                }
            }
        });
    });
}

export async function countActiveLotLines(lotId) {
    return prisma.poLotLine.count({
        where: {
            po_lot_id: lotId,
            is_delete: false
        }
    });
}

export async function softDeleteLot(lotId) {
    return prisma.$transaction(async (tx) => {
        const lot = await findLotById(lotId, tx);

        return tx.poLot.update({
            where: { id: lotId },
            data: {
                lot_no: deletedUniqueValue(lot.lot_no, lot.id),
                is_delete: true,
                delete_at: new Date()
            },
            include: {
                delivery_slot: true,
                lot_lines: {
                    where: activeWhere,
                    include: lotLineInclude
                }
            }
        });
    });
}

export async function findLotById(lotId, client = prisma) {
    return client.poLot.findFirst({
        where: {
            id: lotId,
            is_delete: false
        },
        include: {
            delivery_slot: true,
            lot_lines: {
                where: activeWhere,
                include: lotLineInclude
            }
        }
    });
}

export async function findActiveLotByNo(purchaseOrderId, lotNo, excludeLotId = null) {
    return prisma.poLot.findFirst({
        where: {
            purchase_order_id: purchaseOrderId,
            lot_no: lotNo,
            is_delete: false,
            ...(excludeLotId ? { id: { not: excludeLotId } } : {})
        }
    });
}

export async function findDefaultLotByPurchaseOrderId(purchaseOrderId, client = prisma) {
    return client.poLot.findFirst({
        where: {
            purchase_order_id: purchaseOrderId,
            lot_no: "LOT-001",
            is_delete: false
        },
        include: {
            delivery_slot: true,
            lot_lines: {
                where: activeWhere,
                include: lotLineInclude
            }
        }
    });
}

async function releaseDeletedSlotNo(tx, purchaseOrderId, slotNo) {
    if (!slotNo) {
        return;
    }

    const deletedSlots = await tx.poDeliverySlot.findMany({
        where: {
            purchase_order_id: purchaseOrderId,
            slot_no: slotNo,
            is_delete: true
        }
    });

    for (const slot of deletedSlots) {
        await tx.poDeliverySlot.update({
            where: { id: slot.id },
            data: {
                slot_no: deletedUniqueValue(slot.slot_no, slot.id)
            }
        });
    }
}

async function releaseDeletedLotNo(tx, purchaseOrderId, lotNo) {
    if (!lotNo) {
        return;
    }

    const deletedLots = await tx.poLot.findMany({
        where: {
            purchase_order_id: purchaseOrderId,
            lot_no: lotNo,
            is_delete: true
        }
    });

    for (const lot of deletedLots) {
        await tx.poLot.update({
            where: { id: lot.id },
            data: {
                lot_no: deletedUniqueValue(lot.lot_no, lot.id)
            }
        });
    }
}

async function addQtyToLotLine(tx, targetLotId, sourceLine, qty, notes) {
    const existingLine = await tx.poLotLine.findFirst({
        where: {
            po_lot_id: targetLotId,
            purchase_order_line_id: sourceLine.purchase_order_line_id
        }
    });

    if (existingLine) {
        return tx.poLotLine.update({
            where: { id: existingLine.id },
            data: {
                item_id: sourceLine.item_id,
                qty_lotted: (existingLine.is_delete ? 0 : Number(existingLine.qty_lotted)) + Number(qty),
                unit: sourceLine.unit,
                notes: notes ?? existingLine.notes,
                is_delete: false,
                delete_at: null
            }
        });
    }

    return tx.poLotLine.create({
        data: {
            po_lot_id: targetLotId,
            purchase_order_line_id: sourceLine.purchase_order_line_id,
            item_id: sourceLine.item_id,
            qty_lotted: qty,
            unit: sourceLine.unit,
            notes
        }
    });
}

async function subtractQtyFromLotLine(tx, sourceLine, qty) {
    const remainingQty = Number(sourceLine.qty_lotted) - Number(qty);

    if (remainingQty === 0) {
        return tx.poLotLine.update({
            where: { id: sourceLine.id },
            data: {
                is_delete: true,
                delete_at: new Date()
            }
        });
    }

    return tx.poLotLine.update({
        where: { id: sourceLine.id },
        data: {
            qty_lotted: remainingQty
        }
    });
}

export async function splitLot(lotId, { newLotData, splitLines }) {
    return prisma.$transaction(async (tx) => {
        const sourceLot = await findLotById(lotId, tx);
        await releaseDeletedLotNo(tx, sourceLot.purchase_order_id, newLotData.lot_no);

        const newLot = await tx.poLot.create({
            data: newLotData
        });

        for (const splitLine of splitLines) {
            const sourceLotLine = sourceLot.lot_lines.find((line) => (
                line.purchase_order_line_id === splitLine.purchase_order_line_id
            ));
            const remainingQty = Number(sourceLotLine.qty_lotted) - Number(splitLine.split_qty);

            if (remainingQty === 0) {
                await tx.poLotLine.update({
                    where: { id: sourceLotLine.id },
                    data: {
                        is_delete: true,
                        delete_at: new Date()
                    }
                });
            } else {
                await tx.poLotLine.update({
                    where: { id: sourceLotLine.id },
                    data: {
                        qty_lotted: remainingQty
                    }
                });
            }

            await tx.poLotLine.create({
                data: {
                    po_lot_id: newLot.id,
                    purchase_order_line_id: splitLine.purchase_order_line_id,
                    item_id: sourceLotLine.item_id,
                    qty_lotted: splitLine.split_qty,
                    unit: sourceLotLine.unit,
                    notes: splitLine.notes
                }
            });
        }

        return findLotPlanning(sourceLot.purchase_order_id, tx);
    });
}

export async function transferLotLines(sourceLotId, { targetLotId, transferLines }) {
    return prisma.$transaction(async (tx) => {
        const sourceLot = await findLotById(sourceLotId, tx);
        const targetLot = await findLotById(targetLotId, tx);

        for (const transferLine of transferLines) {
            const sourceLine = sourceLot.lot_lines.find((line) => (
                line.purchase_order_line_id === transferLine.purchase_order_line_id
            ));

            await subtractQtyFromLotLine(tx, sourceLine, transferLine.transfer_qty);
            await addQtyToLotLine(tx, targetLot.id, sourceLine, transferLine.transfer_qty, transferLine.notes);
        }

        return findLotPlanning(sourceLot.purchase_order_id, tx);
    });
}

export async function mergeLots(targetLotId, { sourceLotIds, deleteEmptySourceLots }) {
    return prisma.$transaction(async (tx) => {
        const targetLot = await findLotById(targetLotId, tx);
        const deletedAt = new Date();

        for (const sourceLotId of sourceLotIds) {
            const sourceLot = await findLotById(sourceLotId, tx);

            for (const sourceLine of sourceLot.lot_lines) {
                await addQtyToLotLine(tx, targetLot.id, sourceLine, sourceLine.qty_lotted, sourceLine.notes);
                await tx.poLotLine.update({
                    where: { id: sourceLine.id },
                    data: {
                        is_delete: true,
                        delete_at: deletedAt
                    }
                });
            }

            if (deleteEmptySourceLots) {
                await tx.poLot.update({
                    where: { id: sourceLot.id },
                    data: {
                        is_delete: true,
                        delete_at: deletedAt
                    }
                });
            }
        }

        return findLotPlanning(targetLot.purchase_order_id, tx);
    });
}

export async function resetLotPlanningToDefault(purchaseOrderId) {
    return prisma.$transaction(async (tx) => {
        const deletedAt = new Date();

        let defaultSlot = await tx.poDeliverySlot.findFirst({
            where: {
                purchase_order_id: purchaseOrderId,
                slot_no: "SLOT-001"
            }
        });

        if (defaultSlot) {
            defaultSlot = await tx.poDeliverySlot.update({
                where: { id: defaultSlot.id },
                data: {
                    slot_name: defaultSlot.slot_name || "Default Slot",
                    status: "PLANNED",
                    sort_order: 1,
                    is_delete: false,
                    delete_at: null
                }
            });
        } else {
            defaultSlot = await tx.poDeliverySlot.create({
                data: {
                    purchase_order_id: purchaseOrderId,
                    slot_no: "SLOT-001",
                    slot_name: "Default Slot",
                    status: "PLANNED",
                    sort_order: 1
                }
            });
        }

        let defaultLot = await tx.poLot.findFirst({
            where: {
                purchase_order_id: purchaseOrderId,
                lot_no: "LOT-001"
            }
        });

        if (defaultLot) {
            defaultLot = await tx.poLot.update({
                where: { id: defaultLot.id },
                data: {
                    delivery_slot_id: defaultSlot.id,
                    lot_name: defaultLot.lot_name || "Default LOT",
                    status: "PLANNED",
                    sort_order: 1,
                    is_delete: false,
                    delete_at: null
                }
            });
        } else {
            defaultLot = await tx.poLot.create({
                data: {
                    purchase_order_id: purchaseOrderId,
                    delivery_slot_id: defaultSlot.id,
                    lot_no: "LOT-001",
                    lot_name: "Default LOT",
                    status: "PLANNED",
                    sort_order: 1
                }
            });
        }

        await tx.poLotLine.updateMany({
            where: {
                po_lot: {
                    is: {
                        purchase_order_id: purchaseOrderId
                    }
                },
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        await tx.poLot.updateMany({
            where: {
                purchase_order_id: purchaseOrderId,
                id: {
                    not: defaultLot.id
                },
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        await tx.poDeliverySlot.updateMany({
            where: {
                purchase_order_id: purchaseOrderId,
                id: {
                    not: defaultSlot.id
                },
                is_delete: false
            },
            data: {
                is_delete: true,
                delete_at: deletedAt
            }
        });

        const lines = await tx.purchaseOrderLine.findMany({
            where: {
                purchase_order_id: purchaseOrderId,
                is_delete: false
            }
        });

        for (const line of lines) {
            const existingLine = await tx.poLotLine.findFirst({
                where: {
                    po_lot_id: defaultLot.id,
                    purchase_order_line_id: line.id
                }
            });

            if (existingLine) {
                await tx.poLotLine.update({
                    where: { id: existingLine.id },
                    data: {
                        item_id: line.item_id,
                        qty_lotted: line.qty_ordered,
                        unit: line.unit,
                        is_delete: false,
                        delete_at: null
                    }
                });
            } else {
                await tx.poLotLine.create({
                    data: {
                        po_lot_id: defaultLot.id,
                        purchase_order_line_id: line.id,
                        item_id: line.item_id,
                        qty_lotted: line.qty_ordered,
                        unit: line.unit
                    }
                });
            }

            await tx.purchaseOrderLine.update({
                where: { id: line.id },
                data: {
                    qty_lotted: line.qty_ordered
                }
            });
        }

        return findLotPlanning(purchaseOrderId, tx);
    });
}

export async function moveLotToSlot(lotId, data) {
    return prisma.poLot.update({
        where: { id: lotId },
        data,
        include: {
            delivery_slot: true,
            lot_lines: {
                where: activeWhere,
                include: lotLineInclude
            }
        }
    });
}

export async function reorderLots(reorderLines) {
    return prisma.$transaction(async (tx) => {
        const updatedLots = [];

        for (const line of reorderLines) {
            updatedLots.push(await tx.poLot.update({
                where: { id: line.lot_id },
                data: {
                    delivery_slot_id: line.delivery_slot_id,
                    sort_order: line.sort_order
                }
            }));
        }

        return updatedLots;
    });
}
