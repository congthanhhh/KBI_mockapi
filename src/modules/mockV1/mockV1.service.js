import { mockJsonRepository as repo } from "../../repositories/MockJsonRepository.js";
import { error as apiError } from "../../utils/apiResponse.js";
import { seedMockData } from "../../../scripts/seed-mock-data.js";
import { dtoStatusFlow, lockedLotStatuses, shipmentMilestoneCodes } from "./mockV1.constants.js";

const collections = {
    currencies: "currencies",
    currencyRates: "currency-rates",
    incoterms: "incoterms",
    transportModes: "transport-modes",
    supplierTransportModes: "supplier-transport-modes",
    itemGroups: "item-groups",
    purchaseOrders: "purchase-orders",
    purchaseOrderLines: "purchase-order-lines",
    purchaseOrderConfirmations: "purchase-order-confirmations",
    purchaseOrderConfirmationLines: "purchase-order-confirmation-lines",
    lots: "po-lots",
    lotLines: "po-lot-lines",
    items: "item-master",
    itemCustomsProfiles: "item-customs-profiles",
    suppliers: "suppliers",
    forwarders: "forwarders",
    carriers: "carriers",
    deliveryOrders: "delivery-orders",
    deliveryOrderLots: "delivery-order-lots",
    deliveryOrderLines: "delivery-order-lines",
    deliveryOrderDocuments: "delivery-order-documents",
    documentTypes: "document-types",
    quotationRequests: "quotation-requests",
    quotationRequestLines: "quotation-request-lines",
    quotations: "quotations",
    quotationOptions: "quotation-options",
    quotationChargeLines: "quotation-charge-lines",
    quotationEvents: "quotation-events",
    quotationLineAdjustments: "quotation-line-adjustments",
    shipments: "shipments",
    shipmentLines: "shipment-lines",
    shipmentMilestones: "shipment-milestones",
    shipmentDocuments: "shipment-documents",
    shipmentContainers: "shipment-containers",
    shipmentCosts: "shipment-costs",
    customsDeclarations: "customs-declarations",
    customsDeclarationLines: "customs-declaration-lines",
    carrierDeliveryOrders: "carrier-delivery-orders",
    domesticTransportOrders: "domestic-transport-orders",
    domesticTransportOrderLines: "domestic-transport-order-lines",
    shipmentDtoLinks: "shipment-dto-links",
    logisticsTasks: "logistics-tasks"
};

const collectionAliases = Object.freeze({
    currencies: collections.currencies,
    currency_rates: collections.currencyRates,
    customs_declaration_lines: collections.customsDeclarationLines,
    customs_declarations: collections.customsDeclarations,
    delivery_order_documents: collections.deliveryOrderDocuments,
    document_types: collections.documentTypes,
    delivery_order_lines: collections.deliveryOrderLines,
    delivery_order_lots: collections.deliveryOrderLots,
    delivery_orders: collections.deliveryOrders,
    incoterms: collections.incoterms,
    item_customs_profiles: collections.itemCustomsProfiles,
    item_groups: collections.itemGroups,
    item_master: collections.items,
    po_lot_lines: collections.lotLines,
    po_lots: collections.lots,
    purchase_order_confirmation_lines: collections.purchaseOrderConfirmationLines,
    purchase_order_confirmations: collections.purchaseOrderConfirmations,
    purchase_order_lines: collections.purchaseOrderLines,
    purchase_orders: collections.purchaseOrders,
    quotation_options: collections.quotationOptions,
    quotation_charge_lines: collections.quotationChargeLines,
    quotation_events: collections.quotationEvents,
    quotation_line_adjustments: collections.quotationLineAdjustments,
    quotation_request_lines: collections.quotationRequestLines,
    quotation_requests: collections.quotationRequests,
    quotations: collections.quotations,
    shipment_documents: collections.shipmentDocuments,
    shipment_containers: collections.shipmentContainers,
    shipment_costs: collections.shipmentCosts,
    shipment_lines: collections.shipmentLines,
    shipment_milestones: collections.shipmentMilestones,
    shipments: collections.shipments,
    supplier_transport_modes: collections.supplierTransportModes,
    suppliers: collections.suppliers,
    transport_modes: collections.transportModes,
    carrier_delivery_orders: collections.carrierDeliveryOrders,
    domestic_transport_orders: collections.domesticTransportOrders,
    domestic_transport_order_lines: collections.domesticTransportOrderLines,
    shipment_dto_links: collections.shipmentDtoLinks,
    logistics_tasks: collections.logisticsTasks
});

const shipmentStatusByMilestone = Object.freeze({
    BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
    CARGO_READY: "CARGO_READY",
    PICKED_UP: "PICKED_UP",
    BL_ISSUED: "BL_ISSUED",
    GATE_IN_POL: "GATE_IN_POL",
    ATD: "IN_TRANSIT",
    CUSTOMS_DRAFT: "CUSTOMS_DRAFT",
    ARRIVAL_NOTICE: "ARRIVED",
    CUSTOMS_CLEARED: "CUSTOMS_CLEARED",
    DELIVERED: "DELIVERED"
});

const taskStages = Object.freeze([
    "SUPPLIER_CONFIRMATION",
    "LOT_PLANNING",
    "INTERNAL_DO",
    "QUOTATION",
    "SHIPMENT",
    "CUSTOMS",
    "CARRIER_DO",
    "DTO"
]);

const taskStatuses = Object.freeze([
    "PENDING",
    "IN_PROGRESS",
    "WAITING",
    "BLOCKED",
    "COMPLETED",
    "CANCELLED"
]);

export async function getMockHealth() {
    const names = await repo.listCollectionNames();
    const counts = await Promise.all(names.map(async (name) => ({
        name: toTableName(name),
        count: (await repo.readCollection(name)).length
    })));

    return {
        data_source: "mock",
        collections: counts
    };
}

export async function resetMockData() {
    const seededCollections = await seedMockData();
    return {
        data_source: "mock",
        reset: true,
        collections: seededCollections.map(toTableName)
    };
}

export async function reloadMockData() {
    return getMockHealth();
}

export async function listMockCollection(collection, query = {}) {
    const collectionName = normalizeCollectionName(collection);
    const filter = Object.fromEntries(
        Object.entries(query).filter(([key, value]) => value !== undefined && key !== "page" && key !== "limit")
    );
    return repo.findAll(collectionName, filter);
}

export async function getMockRecord(collection, id) {
    const collectionName = normalizeCollectionName(collection);
    return requireRecord(collectionName, id, "Mock record not found");
}

export async function createMockRecord(collection, body) {
    const collectionName = normalizeCollectionName(collection);
    const rows = await active(collectionName);
    return repo.insert(collectionName, {
        id: body.id || nextId(rows, idPrefixForCollection(collectionName)),
        ...body
    });
}

export async function updateMockRecord(collection, id, body) {
    const collectionName = normalizeCollectionName(collection);
    const updated = await repo.update(collectionName, id, body);

    if (!updated) {
        throw apiError("NOT_FOUND", "Mock record not found", { id }, 404);
    }

    return updated;
}

export async function deleteMockRecord(collection, id) {
    const collectionName = normalizeCollectionName(collection);
    const deleted = await repo.softDelete(collectionName, id);

    if (!deleted) {
        throw apiError("NOT_FOUND", "Mock record not found", { id }, 404);
    }

    return deleted;
}

export async function listCurrencies() {
    return active(collections.currencies);
}

export async function listCurrencyRates() {
    const rates = await active(collections.currencyRates);
    return rates
        .map((rate) => ({ code: rate.code, vnd_rate: Number(rate.vnd_rate ?? 1) }))
        .sort((left, right) => String(left.code).localeCompare(String(right.code)));
}

export async function listIncoterms() {
    return active(collections.incoterms);
}

export async function listTransportModes() {
    return active(collections.transportModes);
}

export async function listSuppliers() {
    return active(collections.suppliers);
}

export async function getSupplier(id) {
    return requireRecord(collections.suppliers, id, "Supplier not found");
}

export async function listItemGroups() {
    return active(collections.itemGroups);
}

export async function listItems() {
    const [items, groups, profiles] = await Promise.all([
        active(collections.items),
        active(collections.itemGroups),
        active(collections.itemCustomsProfiles)
    ]);

    return items.map((item) => ({
        ...item,
        item_group: groups.find((group) => group.id === item.item_group_id) || null,
        customs_profiles: profiles.filter((profile) => profile.item_id === item.id)
    }));
}

export async function getItem(id) {
    const items = await listItems();
    const item = items.find((row) => row.id === id);

    if (!item) {
        throw apiError("NOT_FOUND", "Item not found", { id }, 404);
    }

    return item;
}

export async function listItemCustomsProfiles(itemId) {
    await requireRecord(collections.items, itemId, "Item not found");
    return (await active(collections.itemCustomsProfiles)).filter((profile) => profile.item_id === itemId);
}

export async function listPurchaseOrders(query = {}) {
    const context = await getPurchaseOrderContext();
    const { purchaseOrders, suppliers } = context;
    const search = searchTerm(query);
    const status = String(query.status || "").trim();
    const supplierId = String(query.supplier_id || "").trim();
    const fromDate = String(query.from_date || "").trim();
    const toDate = String(query.to_date || "").trim();

    const items = purchaseOrders
        .map((purchaseOrder) => enrichPurchaseOrder(purchaseOrder, {
            ...context,
            suppliers
        }))
        .filter((purchaseOrder) => {
            const filterDate = String(purchaseOrder.expected_etd || purchaseOrder.expected_eta || purchaseOrder.create_at || "");
            if (status && purchaseOrder.status !== status) return false;
            if (supplierId && purchaseOrder.supplier_id !== supplierId) return false;
            if (fromDate && filterDate < fromDate) return false;
            if (toDate && filterDate > toDate) return false;
            if (!search) return true;
            return purchaseOrderMatchesSearch(purchaseOrder, context, search);
        })
        .sort((left, right) => String(right.create_at || "").localeCompare(String(left.create_at || "")));

    return paginateResult(items, query);
}

export async function getPurchaseOrder(id) {
    const purchaseOrder = await requireRecord(collections.purchaseOrders, id, "Purchase order not found");
    const [lines, context] = await Promise.all([
        getPurchaseOrderLines(id),
        getPurchaseOrderContext()
    ]);

    return {
        ...enrichPurchaseOrder(purchaseOrder, context),
        lines
    };
}

async function getPurchaseOrderContext() {
    const [
        purchaseOrders,
        suppliers,
        currencies,
        incoterms,
        transportModes,
        lines,
        items,
        itemCustomsProfiles,
        lots,
        deliveryOrders,
        shipments,
        shipmentLines,
        domesticTransportOrders
    ] = await Promise.all([
        active(collections.purchaseOrders),
        active(collections.suppliers),
        active(collections.currencies),
        active(collections.incoterms),
        active(collections.transportModes),
        active(collections.purchaseOrderLines),
        active(collections.items),
        active(collections.itemCustomsProfiles),
        active(collections.lots),
        active(collections.deliveryOrders),
        active(collections.shipments),
        active(collections.shipmentLines),
        active(collections.domesticTransportOrders)
    ]);

    return {
        purchaseOrders,
        suppliers,
        currencies,
        incoterms,
        transportModes,
        lines,
        items,
        itemCustomsProfiles,
        lots,
        deliveryOrders,
        shipments,
        shipmentLines,
        domesticTransportOrders
    };
}

function enrichDeliveryOrder(deliveryOrder, context) {
    const purchaseOrder = context.purchaseOrders.find((row) => row.id === deliveryOrder.purchase_order_id) || null;
    const enrichedPurchaseOrder = purchaseOrder ? enrichPurchaseOrder(purchaseOrder, context) : null;
    const shipments = context.shipments
        .filter((shipment) => shipment.delivery_order_id === deliveryOrder.id)
        .sort((left, right) => String(left.etd || left.create_at || "").localeCompare(String(right.etd || right.create_at || "")));

    return {
        ...deliveryOrder,
        linked_shipment_number: shipments[0]?.shipment_no || null,
        shipments,
        purchase_order: enrichedPurchaseOrder,
        transport_mode: context.transportModes.find((mode) => (
            mode.id === deliveryOrder.transport_mode_id ||
            mode.id === enrichedPurchaseOrder?.transport_mode_id
        )) || null
    };
}

function deliveryOrderMatchesSearch(deliveryOrder, search) {
    return [
        deliveryOrder.id,
        deliveryOrder.delivery_order_no,
        deliveryOrder.do_no,
        deliveryOrder.status,
        deliveryOrder.origin_address,
        deliveryOrder.destination_address,
        deliveryOrder.warehouse_name,
        deliveryOrder.notes,
        deliveryOrder.linked_shipment_number,
        deliveryOrder.purchase_order?.po_no,
        deliveryOrder.purchase_order?.contract_no,
        deliveryOrder.purchase_order?.supplier?.supplier_code,
        deliveryOrder.purchase_order?.supplier?.supplier_name,
        deliveryOrder.transport_mode?.mode_code,
        deliveryOrder.transport_mode?.mode_name
    ].some((value) => String(value || "").toLowerCase().includes(search));
}

// PO lifecycle stage taxonomy — mirrors the frontend poStageConfig so the
// backend-computed lifecycle_status maps to the same stage badge the UI shows.
const PO_LIFECYCLE_STAGE_ORDER = ["PROCUREMENT", "PRODUCTION", "IN_TRANSIT", "CUSTOMS", "DELIVERED", "CANCELLED"];
const PO_LIFECYCLE_STATUS_TO_STAGE = {
    DRAFT: "PROCUREMENT", SENT: "PROCUREMENT", CONFIRMED: "PROCUREMENT",
    IN_PRODUCTION: "PRODUCTION", READY_TO_SHIP: "PRODUCTION", CARGO_READY: "PRODUCTION",
    PICKED_UP: "IN_TRANSIT", BL_ISSUED: "IN_TRANSIT", GATE_IN_POL: "IN_TRANSIT", IN_TRANSIT: "IN_TRANSIT", ARRIVED: "IN_TRANSIT",
    CUSTOMS_DRAFT: "CUSTOMS", CUSTOMS_CLEARED: "CUSTOMS",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED"
};
// Maps a shipment.status to the PO lifecycle status code it implies.
const SHIPMENT_STATUS_TO_PO_LIFECYCLE = {
    BOOKING_PENDING: "CARGO_READY", BOOKING_CONFIRMED: "CARGO_READY", CARGO_READY: "CARGO_READY",
    PICKED_UP: "PICKED_UP", BL_ISSUED: "BL_ISSUED", GATE_IN_POL: "GATE_IN_POL",
    ATD: "IN_TRANSIT", IN_TRANSIT: "IN_TRANSIT",
    ARRIVAL_NOTICE: "ARRIVED", ARRIVED: "ARRIVED",
    CUSTOMS_DRAFT: "CUSTOMS_DRAFT", CUSTOMS_CLEARED: "CUSTOMS_CLEARED",
    DELIVERED: "DELIVERED"
};

function poLifecycleStageIndex(statusCode) {
    const stage = PO_LIFECYCLE_STATUS_TO_STAGE[statusCode];
    const index = PO_LIFECYCLE_STAGE_ORDER.indexOf(stage);
    return index >= 0 ? index : PO_LIFECYCLE_STAGE_ORDER.length;
}

// Resolved PO lifecycle status = the LAGGARD (least-advanced) linked shipment's
// mapped status. A PO is only as far along as its slowest shipment. Before any
// shipment exists the PO still sits in its own procurement/production status.
function computePurchaseOrderLifecycleStatus(purchaseOrder, shipments) {
    if (purchaseOrder.status === "CANCELLED") return "CANCELLED";
    const activeShipments = shipments.filter((shipment) => shipment.status && shipment.status !== "CANCELLED");
    if (activeShipments.length === 0) return purchaseOrder.status;
    const codes = activeShipments.map((shipment) => SHIPMENT_STATUS_TO_PO_LIFECYCLE[shipment.status] || "IN_TRANSIT");
    return codes.reduce((laggard, code) => (poLifecycleStageIndex(code) < poLifecycleStageIndex(laggard) ? code : laggard));
}

function enrichPurchaseOrder(purchaseOrder, context) {
    const poLines = context.lines.filter((line) => line.purchase_order_id === purchaseOrder.id);
    const poLots = context.lots.filter((lot) => lot.purchase_order_id === purchaseOrder.id).sort(bySortOrder);
    const deliveryOrders = context.deliveryOrders.filter((deliveryOrder) => deliveryOrder.purchase_order_id === purchaseOrder.id);
    const deliveryOrderIds = new Set(deliveryOrders.map((deliveryOrder) => deliveryOrder.id));
    const shipments = context.shipments.filter((shipment) => deliveryOrderIds.has(shipment.delivery_order_id));
    const shipmentIds = new Set(shipments.map((shipment) => shipment.id));
    const domesticTransportOrders = context.domesticTransportOrders.filter((order) => shipmentIds.has(order.shipment_id));
    const firstShipment = firstByDate(shipments, "etd") || null;
    const firstDto = firstByDate(domesticTransportOrders, "scheduled_delivery_at") || null;
    const lotIds = poLots.map((lot) => lot.lot_no || lot.id);
    const totalWeightKg = roundNumber(poLines.reduce((total, line) => total + Number(line.gross_weight_kg || 0), 0));
    const totalContainers = uniqueValues(shipments.map((shipment) => shipment.container_no).filter(Boolean)).length;
    const delayedDays = getPurchaseOrderDelayedDays(purchaseOrder, shipments, domesticTransportOrders);

    return {
        ...purchaseOrder,
        lines: poLines.sort(bySortOrder).map((line) => enrichPurchaseOrderLine(line, context)),
        supplier: context.suppliers.find((supplier) => supplier.id === purchaseOrder.supplier_id) || null,
        currency: context.currencies.find((currency) => (
            currency.id === purchaseOrder.currency_id ||
            currency.currency_code === purchaseOrder.currency_code
        )) || null,
        incoterm: context.incoterms.find((incoterm) => incoterm.id === purchaseOrder.incoterm_id) || null,
        transport_mode: context.transportModes.find((mode) => mode.id === purchaseOrder.transport_mode_id) || null,
        total_weight_kg: totalWeightKg || null,
        total_containers: totalContainers,
        total_lots: poLots.length,
        lot_ids: lotIds,
        delayed_days: delayedDays,
        // Resolved laggard-shipment lifecycle status; the UI reads this as the
        // single source of truth for the PO stage badge (resolvePoStage).
        lifecycle_status: computePurchaseOrderLifecycleStatus(purchaseOrder, shipments),
        lot_summary: {
            total_weight_kg: totalWeightKg || null,
            total_containers: totalContainers,
            total_lots: poLots.length,
            lot_ids: lotIds
        },
        logistics_timeline: {
            loading_port: {
                etd: firstShipment?.etd || purchaseOrder.expected_etd || null,
                atd: firstShipment?.atd || purchaseOrder.actual_etd || null
            },
            unloading_port: {
                eta: firstShipment?.eta || purchaseOrder.expected_eta || null,
                ata: firstShipment?.ata || purchaseOrder.actual_eta || null
            },
            warehouse: {
                eta: firstDto?.scheduled_delivery_at || purchaseOrder.expected_warehouse_eta || null,
                ata: firstDto?.actual_delivery_at || purchaseOrder.actual_warehouse_ata || null
            }
        }
    };
}

function enrichPurchaseOrderLine(line, context) {
    return {
        ...line,
        item: context.items.find((item) => item.id === line.item_id) || null,
        item_customs_profile: context.itemCustomsProfiles.find((profile) => profile.id === line.item_customs_profile_id) || null
    };
}

function purchaseOrderMatchesSearch(purchaseOrder, context, search) {
    const poLots = context.lots.filter((lot) => lot.purchase_order_id === purchaseOrder.id);
    const poLines = context.lines.filter((line) => line.purchase_order_id === purchaseOrder.id);
    const poLineItemIds = new Set(poLines.map((line) => line.item_id).filter(Boolean));
    const poLineProfileIds = new Set(poLines.map((line) => line.item_customs_profile_id).filter(Boolean));
    const items = context.items.filter((item) => poLineItemIds.has(item.id));
    const profiles = context.itemCustomsProfiles.filter((profile) => poLineProfileIds.has(profile.id));

    return [
        purchaseOrder.id,
        purchaseOrder.po_no,
        purchaseOrder.contract_no,
        purchaseOrder.po_type,
        purchaseOrder.payment_term,
        purchaseOrder.currency_code,
        purchaseOrder.status,
        purchaseOrder.expected_etd,
        purchaseOrder.expected_eta,
        purchaseOrder.origin_port,
        purchaseOrder.destination_port,
        purchaseOrder.actual_etd,
        purchaseOrder.actual_eta,
        purchaseOrder.expected_warehouse_eta,
        purchaseOrder.actual_warehouse_ata,
        purchaseOrder.notes,
        purchaseOrder.supplier?.supplier_code,
        purchaseOrder.supplier?.supplier_name,
        purchaseOrder.supplier?.supplier_short_name,
        purchaseOrder.incoterm?.code,
        purchaseOrder.incoterm?.incoterm_code,
        purchaseOrder.incoterm?.name,
        purchaseOrder.transport_mode?.mode_code,
        purchaseOrder.transport_mode?.mode_name,
        ...poLots.flatMap((lot) => [lot.lot_no, lot.lot_name, lot.status, lot.origin_port, lot.destination_port]),
        ...poLines.flatMap((line) => [line.line_no, line.item_description, line.unit, line.notes]),
        ...items.flatMap((item) => [item.item_code, item.item_name, item.item_description]),
        ...profiles.flatMap((profile) => [profile.hs_code, profile.customs_type, profile.co_form])
    ].some((value) => String(value || "").toLowerCase().includes(search));
}

export async function listPurchaseOrderLines(id) {
    await requireRecord(collections.purchaseOrders, id, "Purchase order not found");
    return getPurchaseOrderLines(id);
}

export async function updatePurchaseOrder(id, body) {
    await requireRecord(collections.purchaseOrders, id, "Purchase order not found");
    const allowedFields = [
        "po_no",
        "contract_no",
        "supplier_id",
        "po_type",
        "incoterm_id",
        "payment_term",
        "currency_code",
        "currency_id",
        "exchange_rate",
        "status",
        "expected_etd",
        "expected_eta",
        "origin_port",
        "destination_port",
        "transport_mode_id",
        "notes"
    ];
    const patch = Object.fromEntries(
        Object.entries(pick(body, allowedFields)).filter(([, value]) => value !== undefined)
    );

    await repo.update(collections.purchaseOrders, id, patch);
    return getPurchaseOrder(id);
}

export async function sendPurchaseOrder(id) {
    return updatePurchaseOrderStatus(id, "SENT");
}

export async function confirmPurchaseOrder(id) {
    return updatePurchaseOrderStatus(id, "CONFIRMED");
}

export async function cancelPurchaseOrder(id) {
    return updatePurchaseOrderStatus(id, "CANCELLED");
}

export async function listPurchaseOrderConfirmations(id) {
    await requireRecord(collections.purchaseOrders, id, "Purchase order not found");
    const confirmations = await active(collections.purchaseOrderConfirmations);
    return confirmations.filter((confirmation) => confirmation.purchase_order_id === id);
}

export async function createPurchaseOrderConfirmation(purchaseOrderId, body) {
    const purchaseOrder = await requireRecord(collections.purchaseOrders, purchaseOrderId, "Purchase order not found");

    if (!["SENT", "CONFIRMED"].includes(purchaseOrder.status)) {
        throw apiError("BUSINESS_RULE_VIOLATION", "PO can be confirmed only from SENT or CONFIRMED status", { status: purchaseOrder.status }, 409);
    }

    const [confirmations, confirmationLines, poLines] = await Promise.all([
        active(collections.purchaseOrderConfirmations),
        active(collections.purchaseOrderConfirmationLines),
        active(collections.purchaseOrderLines)
    ]);
    const confirmation = await repo.insert(collections.purchaseOrderConfirmations, {
        id: nextId(confirmations, "poc"),
        purchase_order_id: purchaseOrderId,
        confirmed_by: body.confirmed_by || "Mock Supplier",
        confirmed_at: body.confirmed_at || new Date().toISOString(),
        supplier_ref_no: body.supplier_ref_no || nextDocumentNo("SUP-CFM", confirmations, "supplier_ref_no"),
        cargo_ready_date: body.cargo_ready_date || null,
        is_full_shipment: body.is_full_shipment ?? true,
        allow_partial_shipment: body.allow_partial_shipment ?? true,
        note: body.note || null
    });

    const sourceLines = Array.isArray(body.lines) && body.lines.length > 0
        ? body.lines
        : poLines
            .filter((line) => line.purchase_order_id === purchaseOrderId)
            .map((line) => ({
                purchase_order_line_id: line.id,
                confirmed_qty: line.qty_ordered,
                cargo_ready_date: body.cargo_ready_date || null,
                note: null
            }));
    const start = nextNumber(confirmationLines, "pocl");

    for (const [index, line] of sourceLines.entries()) {
        await repo.insert(collections.purchaseOrderConfirmationLines, {
            id: formatId("pocl", start + index),
            purchase_order_confirmation_id: confirmation.id,
            purchase_order_line_id: line.purchase_order_line_id,
            confirmed_qty: Number(line.confirmed_qty),
            cargo_ready_date: line.cargo_ready_date || body.cargo_ready_date || null,
            note: line.note || null
        });
    }

    await repo.update(collections.purchaseOrders, purchaseOrderId, {
        status: "CONFIRMED"
    });

    const refreshedConfirmationLines = await active(collections.purchaseOrderConfirmationLines);
    for (const line of poLines.filter((row) => row.purchase_order_id === purchaseOrderId)) {
        const qtyConfirmed = refreshedConfirmationLines
            .filter((row) => row.purchase_order_line_id === line.id)
            .reduce((sum, row) => sum + Number(row.confirmed_qty || 0), 0);
        await repo.update(collections.purchaseOrderLines, line.id, {
            qty_confirmed: qtyConfirmed
        });
    }

    return getPurchaseOrderConfirmation(confirmation.id);
}

export async function getPurchaseOrderConfirmation(id) {
    const confirmation = await requireRecord(collections.purchaseOrderConfirmations, id, "Purchase order confirmation not found");
    const lines = await active(collections.purchaseOrderConfirmationLines);
    return {
        ...confirmation,
        lines: lines.filter((line) => line.purchase_order_confirmation_id === id)
    };
}

export async function createPurchaseOrder(body) {
    requireField(body, "po_no");
    requireField(body, "supplier_id");

    if (!Array.isArray(body.lines) || body.lines.length === 0) {
        throw apiError("VALIDATION_ERROR", "lines must contain at least one PO line", { field: "lines" }, 400);
    }

    const [purchaseOrders, purchaseOrderLines, lots, lotLines] = await Promise.all([
        active(collections.purchaseOrders),
        active(collections.purchaseOrderLines),
        active(collections.lots),
        active(collections.lotLines)
    ]);
    const duplicate = purchaseOrders.find((purchaseOrder) => purchaseOrder.po_no === body.po_no);

    if (duplicate) {
        throw apiError("STATE_CONFLICT", "po_no already exists", { po_no: body.po_no }, 409);
    }

    // Reversed flow: a PO can only be created from a CONFIRMED quotation. Mirrors
    // the shipment-from-DO guard. quotation_id is persisted for traceability.
    requireField(body, "quotation_id");
    const quotation = await requireRecord(collections.quotations, body.quotation_id, "Quotation not found");
    if (quotation.status !== "CONFIRMED") {
        throw apiError(
            "BUSINESS_RULE_VIOLATION",
            "PO can be created only from a CONFIRMED quotation",
            { quotation_id: body.quotation_id, status: quotation.status },
            409
        );
    }

    const purchaseOrder = await repo.insert(collections.purchaseOrders, {
        id: nextId(purchaseOrders, "po"),
        po_no: body.po_no,
        quotation_id: body.quotation_id,
        contract_no: body.contract_no || nextDocumentNo("KBI-CN", purchaseOrders, "contract_no"),
        supplier_id: body.supplier_id,
        po_type: body.po_type || "IMPORT",
        incoterm_id: body.incoterm_id || "inc_fob",
        payment_term: body.payment_term || null,
        currency_code: body.currency_code || "USD",
        currency_id: body.currency_id || null,
        exchange_rate: body.exchange_rate || 25000,
        status: body.status || "DRAFT",
        expected_etd: body.expected_etd || null,
        expected_eta: body.expected_eta || null,
        origin_port: body.origin_port || null,
        destination_port: body.destination_port || null,
        transport_mode_id: body.transport_mode_id || null,
        notes: body.notes || null
    });
    const lot = await repo.insert(collections.lots, {
        id: nextId(lots, "lot"),
        purchase_order_id: purchaseOrder.id,
        lot_no: "LOT-001",
        lot_name: "Default Lot",
        status: "PLANNED",
        planned_cargo_ready_date: body.planned_cargo_ready_date || null,
        planned_etd: body.expected_etd || null,
        planned_eta: body.expected_eta || null,
        origin_port: body.origin_port || null,
        destination_port: body.destination_port || null,
        sort_order: 1,
        notes: "Default LOT created with PO."
    });
    const lineStart = nextNumber(purchaseOrderLines, "po_line");
    const lotLineStart = nextNumber(lotLines, "lot_line");

    for (const [index, line] of body.lines.entries()) {
        requireField(line, "item_id");
        requireField(line, "qty_ordered");
        const purchaseOrderLine = await repo.insert(collections.purchaseOrderLines, {
            id: formatId("po_line", lineStart + index),
            purchase_order_id: purchaseOrder.id,
            item_id: line.item_id,
            item_customs_profile_id: line.item_customs_profile_id || null,
            line_no: line.line_no || index + 1,
            item_description: line.item_description || null,
            qty_ordered: Number(line.qty_ordered),
            unit: line.unit || "PCS",
            unit_price: line.unit_price || 0,
            tax_rate: line.tax_rate || 0,
            discount_pct: line.discount_pct || 0,
            gross_weight_kg: Number(line.gross_weight_kg || 0),
            qty_confirmed: 0,
            qty_lotted: Number(line.qty_ordered),
            qty_shipped: 0,
            qty_received: 0,
            expected_eta_line: line.expected_eta_line || body.expected_eta || null,
            notes: line.notes || null,
            sort_order: index + 1
        });
        await repo.insert(collections.lotLines, {
            id: formatId("lot_line", lotLineStart + index),
            po_lot_id: lot.id,
            purchase_order_line_id: purchaseOrderLine.id,
            item_id: purchaseOrderLine.item_id,
            qty_lotted: purchaseOrderLine.qty_ordered,
            unit: purchaseOrderLine.unit,
            notes: null,
            sort_order: index + 1
        });
    }

    return getLotPlanning(purchaseOrder.id);
}

export async function getLotPlanning(id) {
    const purchaseOrder = await requireRecord(collections.purchaseOrders, id, "Purchase order not found");
    const [poLines, lots, lotLines, items] = await Promise.all([
        getPurchaseOrderLines(id),
        active(collections.lots),
        active(collections.lotLines),
        active(collections.items)
    ]);
    const poLots = lots
        .filter((lot) => lot.purchase_order_id === id)
        .sort(bySortOrder);

    return {
        purchase_order: purchaseOrder,
        po_lines: poLines,
        lots: poLots.map((lot) => ({
            ...lot,
            items: lotLines
                .filter((line) => line.po_lot_id === lot.id)
                .sort(bySortOrder)
                .map((line) => enrichLotLine(line, poLines, items))
        }))
    };
}

export async function createLot(purchaseOrderId, body) {
    const purchaseOrder = await requireRecord(collections.purchaseOrders, purchaseOrderId, "Purchase order not found");
    requireField(body, "lot_no");
    const lots = await active(collections.lots);
    const duplicate = lots.find((lot) => lot.purchase_order_id === purchaseOrderId && lot.lot_no === body.lot_no);

    if (duplicate) {
        throw apiError("STATE_CONFLICT", "lot_no already exists in this purchase order", { lot_no: body.lot_no }, 409);
    }

    const sortOrder = maxSort(lots.filter((lot) => lot.purchase_order_id === purchaseOrderId)) + 1;
    return repo.insert(collections.lots, {
        id: nextId(lots, "lot"),
        purchase_order_id: purchaseOrderId,
        lot_no: body.lot_no,
        lot_name: body.lot_name || body.lot_no,
        status: body.status || "PLANNED",
        planned_cargo_ready_date: body.planned_cargo_ready_date || null,
        planned_etd: body.planned_etd || null,
        planned_eta: body.planned_eta || null,
        origin_port: body.origin_port || purchaseOrder.origin_port || null,
        destination_port: body.destination_port || purchaseOrder.destination_port || null,
        sort_order: body.sort_order || sortOrder,
        notes: body.notes || null
    });
}

export async function updateLot(lotId, body) {
    await requireRecord(collections.lots, lotId, "LOT not found");
    const allowedFields = [
        "lot_no",
        "lot_name",
        "status",
        "planned_cargo_ready_date",
        "planned_etd",
        "planned_eta",
        "origin_port",
        "destination_port",
        "sort_order",
        "notes"
    ];
    return repo.update(collections.lots, lotId, pick(body, allowedFields));
}

export async function deleteLot(lotId) {
    const lot = await requireRecord(collections.lots, lotId, "LOT not found");
    const [lots, lotLines] = await Promise.all([
        active(collections.lots),
        active(collections.lotLines)
    ]);
    const poLots = lots.filter((row) => row.purchase_order_id === lot.purchase_order_id);
    const hasItems = lotLines.some((line) => line.po_lot_id === lotId);

    if (hasItems) {
        throw apiError("STATE_CONFLICT", "LOT must be empty before delete", { lot_id: lotId }, 409);
    }

    if (poLots.length <= 1) {
        throw apiError("STATE_CONFLICT", "Cannot delete the last LOT of a purchase order", { purchase_order_id: lot.purchase_order_id }, 409);
    }

    return repo.softDelete(collections.lots, lotId);
}

export async function moveLotLine(lineId, body) {
    requireField(body, "target_lot_id");
    const sourceLine = await requireRecord(collections.lotLines, lineId, "LOT line not found");
    const [sourceLot, targetLot] = await Promise.all([
        requireRecord(collections.lots, sourceLine.po_lot_id, "Source LOT not found"),
        requireRecord(collections.lots, body.target_lot_id, "Target LOT not found")
    ]);
    ensureLotUnlocked(sourceLot);
    ensureLotUnlocked(targetLot);

    if (sourceLot.purchase_order_id !== targetLot.purchase_order_id) {
        throw apiError("VALIDATION_ERROR", "target_lot_id must belong to the same purchase order", {}, 400);
    }

    const lotLines = await active(collections.lotLines);
    const targetLine = lotLines.find((line) => (
        line.po_lot_id === targetLot.id &&
        line.purchase_order_line_id === sourceLine.purchase_order_line_id &&
        line.id !== sourceLine.id
    ));

    if (targetLine) {
        await repo.update(collections.lotLines, targetLine.id, {
            qty_lotted: Number(targetLine.qty_lotted) + Number(sourceLine.qty_lotted),
            sort_order: body.target_sort_order || targetLine.sort_order
        });
        await repo.softDelete(collections.lotLines, sourceLine.id);
    } else {
        await repo.update(collections.lotLines, sourceLine.id, {
            po_lot_id: targetLot.id,
            sort_order: body.target_sort_order || sourceLine.sort_order
        });
    }

    return getLotPlanning(sourceLot.purchase_order_id);
}

export async function splitLotLine(lineId, body) {
    requireField(body, "target_lot_id");
    requireField(body, "split_qty");
    const splitQty = Number(body.split_qty);
    const sourceLine = await requireRecord(collections.lotLines, lineId, "LOT line not found");

    if (!(splitQty > 0) || splitQty >= Number(sourceLine.qty_lotted)) {
        throw apiError("VALIDATION_ERROR", "split_qty must be greater than 0 and less than source qty_lotted", {}, 400);
    }

    const [sourceLot, targetLot, poLine] = await Promise.all([
        requireRecord(collections.lots, sourceLine.po_lot_id, "Source LOT not found"),
        requireRecord(collections.lots, body.target_lot_id, "Target LOT not found"),
        requireRecord(collections.purchaseOrderLines, sourceLine.purchase_order_line_id, "PO line not found")
    ]);
    ensureLotUnlocked(sourceLot);
    ensureLotUnlocked(targetLot);

    if (sourceLot.purchase_order_id !== targetLot.purchase_order_id) {
        throw apiError("VALIDATION_ERROR", "target_lot_id must belong to the same purchase order", {}, 400);
    }

    const lotLines = await active(collections.lotLines);
    const currentTotal = lotLines
        .filter((line) => line.purchase_order_line_id === sourceLine.purchase_order_line_id)
        .reduce((sum, line) => sum + Number(line.qty_lotted), 0);

    if (currentTotal > Number(poLine.qty_ordered)) {
        throw apiError("BUSINESS_RULE_VIOLATION", "Total qty_lotted cannot exceed qty_ordered", {}, 409);
    }

    await repo.update(collections.lotLines, sourceLine.id, {
        qty_lotted: Number(sourceLine.qty_lotted) - splitQty
    });

    const targetLine = lotLines.find((line) => (
        line.po_lot_id === targetLot.id &&
        line.purchase_order_line_id === sourceLine.purchase_order_line_id
    ));

    if (targetLine) {
        await repo.update(collections.lotLines, targetLine.id, {
            qty_lotted: Number(targetLine.qty_lotted) + splitQty,
            sort_order: body.target_sort_order || targetLine.sort_order
        });
    } else {
        await repo.insert(collections.lotLines, {
            id: nextId(lotLines, "lot_line"),
            po_lot_id: targetLot.id,
            purchase_order_line_id: sourceLine.purchase_order_line_id,
            item_id: sourceLine.item_id,
            qty_lotted: splitQty,
            unit: sourceLine.unit,
            notes: sourceLine.notes || null,
            sort_order: body.target_sort_order || maxSort(lotLines.filter((line) => line.po_lot_id === targetLot.id)) + 1
        });
    }

    return getLotPlanning(sourceLot.purchase_order_id);
}

export async function reorderLots(body) {
    requireField(body, "purchase_order_id");
    requireField(body, "ordered_lot_ids");
    const lots = await active(collections.lots);
    const poLots = lots.filter((lot) => lot.purchase_order_id === body.purchase_order_id);

    if (body.ordered_lot_ids.length !== poLots.length) {
        throw apiError("VALIDATION_ERROR", "ordered_lot_ids must include every active LOT for the purchase order", {}, 400);
    }

    for (const [index, id] of body.ordered_lot_ids.entries()) {
        await repo.update(collections.lots, id, {
            sort_order: index + 1
        });
    }
    return getLotPlanning(body.purchase_order_id);
}

export async function reorderLotLines(body) {
    requireField(body, "lot_id");
    requireField(body, "ordered_lot_line_ids");
    const lot = await requireRecord(collections.lots, body.lot_id, "LOT not found");
    const lotLines = (await active(collections.lotLines)).filter((line) => line.po_lot_id === body.lot_id);

    if (body.ordered_lot_line_ids.length !== lotLines.length) {
        throw apiError("VALIDATION_ERROR", "ordered_lot_line_ids must include every active LOT line for the LOT", {}, 400);
    }

    for (const [index, id] of body.ordered_lot_line_ids.entries()) {
        await repo.update(collections.lotLines, id, {
            sort_order: index + 1
        });
    }
    return getLotPlanning(lot.purchase_order_id);
}

export async function createDeliveryOrderFromLots(body) {
    requireField(body, "lot_ids");
    const lotIds = body.lot_ids;
    const [lots, activeDoLots, allDoLines] = await Promise.all([
        active(collections.lots),
        active(collections.deliveryOrderLots),
        active(collections.deliveryOrderLines)
    ]);
    const selectedLots = lotIds.map((id) => lots.find((lot) => lot.id === id)).filter(Boolean);

    if (selectedLots.length !== lotIds.length) {
        throw apiError("NOT_FOUND", "One or more LOTs were not found", { lot_ids: lotIds }, 404);
    }

    const purchaseOrderIds = new Set(selectedLots.map((lot) => lot.purchase_order_id));
    if (purchaseOrderIds.size > 1) {
        throw apiError("VALIDATION_ERROR", "All LOTs must belong to the same purchase order", { lot_ids: lotIds }, 400);
    }

    const assignedLot = activeDoLots.find((row) => lotIds.includes(row.po_lot_id));

    if (assignedLot) {
        throw apiError("STATE_CONFLICT", "Active LOT can belong to only one active delivery order", { lot_id: assignedLot.po_lot_id }, 409);
    }

    const deliveryOrders = await active(collections.deliveryOrders);
    const purchaseOrder = await requireRecord(collections.purchaseOrders, selectedLots[0].purchase_order_id, "Purchase order not found");
    const primaryLot = selectedLots[0];
    const deliveryOrder = await repo.insert(collections.deliveryOrders, {
        id: nextId(deliveryOrders, "do"),
        delivery_order_no: body.delivery_order_no || nextDocumentNo("DO-KBI-2026", deliveryOrders, "delivery_order_no"),
        purchase_order_id: selectedLots[0].purchase_order_id,
        transport_mode_id: body.transport_mode_id || purchaseOrder.transport_mode_id || null,
        status: "DRAFT",
        requested_pickup_date: body.requested_pickup_date || primaryLot.planned_cargo_ready_date || null,
        planned_cargo_ready_date: body.planned_cargo_ready_date || primaryLot.planned_cargo_ready_date || null,
        planned_etd: body.planned_etd || primaryLot.planned_etd || purchaseOrder.expected_etd || null,
        planned_eta: body.planned_eta || primaryLot.planned_eta || purchaseOrder.expected_eta || null,
        origin_address: body.origin_address || primaryLot.origin_port || purchaseOrder.origin_port || "Shanghai Port",
        destination_address: body.destination_address || primaryLot.destination_port || purchaseOrder.destination_port || "CatLai Port",
        warehouse_name: body.warehouse_name || "Kim Binh Main Warehouse",
        notes: body.notes || null
    });
    const lotLines = await active(collections.lotLines);

    const doLotStart = nextNumber(activeDoLots, "do_lot");
    const doLineStart = nextNumber(allDoLines, "do_line");
    const selectedLotLines = lotLines.filter((line) => lotIds.includes(line.po_lot_id));
    for (const [index, lot] of selectedLots.entries()) {
        await repo.insert(collections.deliveryOrderLots, {
            id: formatId("do_lot", doLotStart + index),
            delivery_order_id: deliveryOrder.id,
            po_lot_id: lot.id,
            sort_order: index + 1
        });
    }

    for (const [index, line] of selectedLotLines.entries()) {
        await repo.insert(collections.deliveryOrderLines, {
            id: formatId("do_line", doLineStart + index),
            delivery_order_id: deliveryOrder.id,
            po_lot_id: line.po_lot_id,
            purchase_order_line_id: line.purchase_order_line_id,
            item_id: line.item_id,
            qty: line.qty_lotted,
            unit: line.unit,
            sort_order: index + 1
        });
    }

    for (const lot of selectedLots) {
        await repo.update(collections.lots, lot.id, {
            status: "ASSIGNED_TO_SHIPMENT"
        });
    }

    return getDeliveryOrder(deliveryOrder.id);
}

export async function listDeliveryOrders(query = {}) {
    const [deliveryOrders, context] = await Promise.all([
        active(collections.deliveryOrders),
        getPurchaseOrderContext()
    ]);
    const search = searchTerm(query);

    const items = deliveryOrders
        .map((deliveryOrder) => enrichDeliveryOrder(deliveryOrder, context))
        .filter((deliveryOrder) => {
            if (query.status && deliveryOrder.status !== query.status) return false;
            if (query.purchase_order_id && deliveryOrder.purchase_order_id !== query.purchase_order_id) return false;
            if (query.transport_mode_id && deliveryOrder.transport_mode_id !== query.transport_mode_id) return false;
            if (!search) return true;
            return deliveryOrderMatchesSearch(deliveryOrder, search);
        })
        .sort((left, right) => String(right.create_at || "").localeCompare(String(left.create_at || "")));

    return paginateResult(items, query);
}

export async function listLogisticsTasks() {
    return active(collections.logisticsTasks);
}

export async function listTasks(query = {}) {
    const taskRows = await active(collections.logisticsTasks);
    const items = filterTasks(taskRows.map(projectLogisticsTaskToScreenItem), query);

    return {
        data: {
            items,
            summary: buildTaskSummary(items),
            filters: {
                statuses: taskStatuses,
                priorities: ["LOW", "MEDIUM", "HIGH", "URGENT"]
            }
        },
        meta: {
            total: items.length
        }
    };
}

export async function getTask(id) {
    const task = await findTaskItem(id);

    if (!task) {
        throw apiError("NOT_FOUND", "Task not found", { id }, 404);
    }

    return {
        ...task,
        description: null,
        related_records: {},
        activity: []
    };
}

export async function listPurchaseOrderTasks(purchaseOrderId) {
    const purchaseOrder = await requireRecord(collections.purchaseOrders, purchaseOrderId, "Purchase order not found");
    const taskRows = await active(collections.logisticsTasks);
    return buildPurchaseOrderTaskScreen(purchaseOrder, taskRows.map(projectLogisticsTaskToScreenItem));
}

export async function createTask(body = {}) {
    const taskName = String(body.task_name || "").trim();

    if (!taskName) {
        throw apiError("VALIDATION_ERROR", "task_name is required", { field: "task_name" }, 400);
    }

    if (body.status !== undefined && !taskStatuses.includes(body.status)) {
        throw apiError("VALIDATION_ERROR", "Invalid task status", { status: body.status }, 400);
    }

    const items = await active(collections.logisticsTasks);
    const id = nextTaskId(items);
    const templateFields = await resolveTaskTemplateFields(body.task_template_id || null);
    const nowIso = new Date().toISOString();
    const refNo = body.ref_no || body.ref_id || "";

    const task = {
        id,
        task_id: id,
        task_no: body.task_no || id.toUpperCase().replace("_", "-"),
        task_name: taskName || templateFields.task_name || "Untitled task",
        do_number: body.do_number || (body.ref_type === "DELIVERY_ORDER" ? refNo : null),
        po_number: body.po_number || (body.ref_type !== "DELIVERY_ORDER" ? refNo : null),
        request_code: body.request_code || refNo,
        hbl_number: body.hbl_number || null,
        production_contract_number: body.production_contract_number || "",
        assignee: {
            id: body.assignee?.id ?? body.assignee?.user_id ?? null,
            name: body.assignee?.name || "Unassigned",
            department: body.department ?? templateFields.department ?? null
        },
        assignee_code: body.assignee_code ?? body.assignee?.code ?? templateFields.assignee_code ?? null,
        department: body.department ?? templateFields.department ?? null,
        status: body.status || "PENDING",
        priority: body.priority || "MEDIUM",
        due_date: body.due_date || body.due_at || null,
        completed_at: null,
        progress: Number(body.progress) || 0,
        blocked_reason: body.blocked_reason ?? null,
        blocked_by_party: body.blocked_by_party ?? null,
        notes: body.note || body.notes || null,
        is_required_for_do_closure: Boolean(body.is_required_for_do_closure),
        created_at: nowIso,
        assigned_at: nowIso,
        create_at: nowIso,
        update_at: nowIso,
        delete_at: null,
        is_delete: false,
        ...templateFields,
        task_name: taskName || templateFields.task_name || "Untitled task"
    };

    await repo.insert(collections.logisticsTasks, task);

    return getTask(id);
}

export async function updateTask(id, body) {
    const patch = buildTaskPatch(body);

    if (body.task_template_id !== undefined) {
        Object.assign(patch, await resolveTaskTemplateFields(body.task_template_id || null));
    }

    return persistTaskPatch(id, patch);
}

export async function assignTask(id, body) {
    const assignee = normalizeAssignee(body);
    return persistTaskPatch(id, { assignee });
}

function nextTaskId(items) {
    let max = 0;
    for (const item of items) {
        const match = /^task_(\d+)$/.exec(item.id || "");
        if (match) {
            max = Math.max(max, Number(match[1]));
        }
    }
    return `task_${String(max + 1).padStart(3, "0")}`;
}

// Resolve the SOP Task Template (master data) fields a runtime task should snapshot.
async function resolveTaskTemplateFields(templateId) {
    const fields = {
        task_template_id: templateId || null,
        task_name: null,
        milestone_code: null,
        department: null,
        assignee_code: null,
        sla_hours: null,
        sla_text: null,
        related_documents: null,
        is_required_for_do_closure: false,
        template_group_code: null,
        template_group_name: null
    };

    if (!templateId) {
        return fields;
    }

    const template = await repo.findById("task-templates", templateId);

    if (!template) {
        return fields;
    }

    return {
        ...fields,
        milestone_code: template.milestone_code ?? null,
        department: template.department ?? null,
        assignee_code: template.assignee_code ?? null,
        task_name: template.task_name ?? null,
        sla_hours: template.sla_hours ?? null,
        sla_text: template.sla_text ?? null,
        related_documents: template.related_documents ?? null,
        is_required_for_do_closure: template.is_required_for_closure ?? false,
        template_group_code: template.group_code ?? null,
        template_group_name: template.group_name ?? null
    };
}

export async function getDeliveryOrder(id) {
    const deliveryOrder = await requireRecord(collections.deliveryOrders, id, "Delivery order not found");
    const [doLots, doLines, context] = await Promise.all([
        active(collections.deliveryOrderLots),
        active(collections.deliveryOrderLines),
        getPurchaseOrderContext()
    ]);
    return {
        ...enrichDeliveryOrder(deliveryOrder, context),
        lots: doLots.filter((row) => row.delivery_order_id === id),
        lines: doLines
            .filter((row) => row.delivery_order_id === id)
            .sort(bySortOrder)
            .map((line) => enrichDeliveryOrderLine(line, context))
    };
}

export async function listDeliveryOrdersByPurchaseOrder(purchaseOrderId) {
    await requireRecord(collections.purchaseOrders, purchaseOrderId, "Purchase order not found");
    const [deliveryOrders, context] = await Promise.all([
        active(collections.deliveryOrders),
        getPurchaseOrderContext()
    ]);
    return deliveryOrders
        .filter((deliveryOrder) => deliveryOrder.purchase_order_id === purchaseOrderId)
        .map((deliveryOrder) => enrichDeliveryOrder(deliveryOrder, context));
}

export async function listDeliveryOrderLots(deliveryOrderId) {
    await requireRecord(collections.deliveryOrders, deliveryOrderId, "Delivery order not found");
    const [doLots, lots] = await Promise.all([
        active(collections.deliveryOrderLots),
        active(collections.lots)
    ]);

    return doLots
        .filter((row) => row.delivery_order_id === deliveryOrderId)
        .map((row) => ({
            ...row,
            lot: lots.find((lot) => lot.id === row.po_lot_id) || null
        }));
}

export async function listDeliveryOrderLines(deliveryOrderId) {
    await requireRecord(collections.deliveryOrders, deliveryOrderId, "Delivery order not found");
    const context = await getPurchaseOrderContext();
    return (await active(collections.deliveryOrderLines))
        .filter((line) => line.delivery_order_id === deliveryOrderId)
        .sort(bySortOrder)
        .map((line) => enrichDeliveryOrderLine(line, context));
}

// ---------------------------------------------------------------------------
// Delivery Order screen-DTO (backend owns the screen shape the frontend renders).
// Ports the presentational mapping the FE used to do locally, and additionally
// computes the previously-synthesized fields (task_summary, missing_documents,
// warehouse actual entry) from real mock data so the DO screen tells the truth.
// ---------------------------------------------------------------------------

const DO_PORT_HINT_REGEX = /port|cang|cảng|cat\s?lai|cát\s?lái/i;

function toDateOnlyValue(value) {
    return value ? String(value).slice(0, 10) : null;
}

function toScreenNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function mapDeliveryOrderScreenStatus(status) {
    return status === "SHIPPED" ? "IN_TRANSIT" : status;
}

// Maps a linked shipment.status to the Internal-DO status it implies, so the DO
// screen reflects the shipment journey once the DO has been handed off. Mirrors
// the frontend DO status taxonomy (deliveryOrderStatusTabs).
const SHIPMENT_STATUS_TO_DO_STATUS = {
    BOOKING_PENDING: "ASSIGNED_TO_SHIPMENT", BOOKING_CONFIRMED: "ASSIGNED_TO_SHIPMENT", CARGO_READY: "ASSIGNED_TO_SHIPMENT",
    PICKED_UP: "IN_TRANSIT", BL_ISSUED: "IN_TRANSIT", GATE_IN_POL: "IN_TRANSIT", ATD: "IN_TRANSIT", IN_TRANSIT: "IN_TRANSIT",
    ARRIVAL_NOTICE: "ARRIVED_PORT", ARRIVED: "ARRIVED_PORT",
    CUSTOMS_DRAFT: "CUSTOMS_PROCESSING", CUSTOMS_CLEARED: "CUSTOMS_CLEARED",
    DELIVERED: "DELIVERED"
};
const DO_STATUS_PROGRESS_ORDER = [
    "DRAFT", "CREATED", "READY_FOR_QUOTATION", "QUOTATION_CONFIRMED", "ASSIGNED_TO_SHIPMENT",
    "IN_TRANSIT", "ARRIVED_PORT", "CUSTOMS_PROCESSING", "CUSTOMS_CLEARED", "WAREHOUSE_PENDING", "DELIVERED", "CLOSED"
];
function doStatusOrderIndex(status) {
    const index = DO_STATUS_PROGRESS_ORDER.indexOf(status);
    return index >= 0 ? index : DO_STATUS_PROGRESS_ORDER.length;
}

// Internal DO display status: its own status until it is handed to a shipment,
// then the LAGGARD (least-advanced) linked shipment's status mapped to the DO
// taxonomy. The runtime flow only advances the DO record up to
// ASSIGNED_TO_SHIPMENT; the transit/customs/delivered journey lives on the
// shipment, so the screen derives those stages instead of storing them twice.
// CANCELLED / CLOSED are terminal DO states and keep the DO's own status.
function resolveDeliveryOrderScreenStatus(enrichedDeliveryOrder) {
    const ownStatus = mapDeliveryOrderScreenStatus(enrichedDeliveryOrder.status);
    if (ownStatus === "CANCELLED" || ownStatus === "CLOSED") return ownStatus;
    const activeShipments = (enrichedDeliveryOrder.shipments || []).filter((shipment) => shipment.status && shipment.status !== "CANCELLED");
    if (activeShipments.length === 0) return ownStatus;
    const codes = activeShipments.map((shipment) => SHIPMENT_STATUS_TO_DO_STATUS[shipment.status] || "IN_TRANSIT");
    return codes.reduce((laggard, code) => (doStatusOrderIndex(code) < doStatusOrderIndex(laggard) ? code : laggard));
}

function inferDeliveryOrderShippingMethod(deliveryOrder) {
    const modeType = String(
        deliveryOrder.transport_mode?.mode_type ||
        deliveryOrder.transport_mode?.mode_code ||
        ""
    ).toUpperCase();
    if (modeType === "AIR") return "AIR";
    if (modeType === "ROAD" || modeType === "TRUCKING" || modeType.includes("TRUCK")) return "ROAD";
    return "SEA";
}

function resolveDeliveryOrderDestinationPort(deliveryOrder, firstLot, shippingMethod) {
    const explicitPort = firstLot?.lot?.destination_port || firstLot?.po_lot?.destination_port;
    if (explicitPort) return explicitPort;
    const destination = deliveryOrder.destination_address || "";
    if (DO_PORT_HINT_REGEX.test(destination)) return destination;
    return shippingMethod === "AIR" ? "Tan Son Nhat Airport" : "CatLai Port";
}

function buildDeliveryOrderSourceLine(deliveryOrder, line, purchaseOrder, orderNo) {
    const purchaseOrderLine = line.purchase_order_line || null;
    const item = line.item || purchaseOrderLine?.item || null;
    const shipmentContainer = Array.isArray(line.shipment?.container_no)
        ? line.shipment.container_no.filter(Boolean).join(", ")
        : line.shipment?.container_no;
    const lineQuantity = toScreenNumber(line.qty);
    const orderedQuantity = toScreenNumber(purchaseOrderLine?.qty_ordered);
    const lineGrossWeight = toScreenNumber(purchaseOrderLine?.gross_weight_kg);
    const allocatedWeight = lineGrossWeight > 0 && orderedQuantity > 0
        ? (lineGrossWeight * lineQuantity) / orderedQuantity
        : (lineGrossWeight || null);

    return {
        id: line.id,
        do_number: orderNo,
        lot_number: line.lot_no || line.lot?.lot_no || null,
        shipment_number: line.shipment_number || line.shipment?.shipment_no || deliveryOrder.linked_shipment_number || null,
        item_code: item?.item_code || line.item_id,
        item_name: item?.item_name || line.item_description || "",
        hs_code: line.hs_code || purchaseOrderLine?.item_customs_profile?.hs_code || null,
        po_line_id: line.purchase_order_line_id,
        po_number: purchaseOrder?.po_no || deliveryOrder.purchase_order_id,
        pr_line_id: "",
        quantity: lineQuantity,
        ordered_quantity: orderedQuantity || null,
        request_code: purchaseOrder?.po_no || orderNo,
        unit: line.unit,
        weight_kg: allocatedWeight,
        container_count: purchaseOrder?.total_containers ?? purchaseOrder?.lot_summary?.total_containers ?? null,
        container_no: line.container_no || shipmentContainer || null,
        route_origin: line.route_origin || line.shipment?.pol || deliveryOrder.origin_address || null,
        route_destination: line.route_destination || line.shipment?.pod || deliveryOrder.destination_address || null,
        etd: toDateOnlyValue(line.etd || line.shipment?.etd || deliveryOrder.planned_etd),
        eta: toDateOnlyValue(line.eta || line.shipment?.eta || deliveryOrder.planned_eta)
    };
}

function computeDeliveryOrderTaskSummary(orderNo, tasks) {
    const doTasks = tasks.filter((task) => task.do_number === orderNo);
    return {
        total_tasks: doTasks.length,
        completed_tasks: doTasks.filter((task) => task.status === "COMPLETED").length,
        blocked_tasks: doTasks.filter((task) => task.status === "BLOCKED" || Boolean(task.blocked_reason)).length,
        required_tasks_remaining: doTasks.filter((task) => task.is_required_for_do_closure && task.status !== "COMPLETED").length
    };
}

function computeDeliveryOrderMissingDocuments(shipments, shipmentDocuments) {
    const shipmentIds = new Set((shipments || []).map((shipment) => shipment.id));
    const rejected = shipmentDocuments
        .filter((doc) => shipmentIds.has(doc.shipment_id) && doc.status === "REJECTED")
        .map((doc) => doc.document_type)
        .filter(Boolean);
    return [...new Set(rejected)];
}

// Fallback required set, used only when the document-types catalog is empty. The
// authoritative required set is the admin-configurable `document-types` collection
// (is_required) read via getRequiredDocumentTypeCodes.
const REQUIRED_DO_DOCUMENT_TYPES = ["Invoice", "Packing List", "B/L", "CO"];

// Admin-configurable required-document codes from the document-types master catalog.
async function getRequiredDocumentTypeCodes() {
    const types = await active(collections.documentTypes);
    const required = types
        .filter((type) => type.is_required && type.is_active !== false)
        .sort(bySortOrder)
        .map((type) => type.code)
        .filter(Boolean);
    return required.length > 0 ? required : [...REQUIRED_DO_DOCUMENT_TYPES];
}

function computeDeliveryOrderDocumentsList(deliveryOrderId, deliveryOrderDocuments, requiredTypes = REQUIRED_DO_DOCUMENT_TYPES) {
    const received = (deliveryOrderDocuments || [])
        .filter((doc) => doc.delivery_order_id === deliveryOrderId && doc.status !== "REJECTED" && doc.status !== "CANCELLED")
        .map((doc) => doc.document_type)
        .filter(Boolean);
    return requiredTypes.filter((type) => received.includes(type));
}

// Derived, reversible "documents complete" gate for a DO. Two tiers matching the
// closure dialog: a required type with NO usable file -> outstanding (blocks close);
// a required type that has file(s) but none VERIFIED -> unverified (soft warning).
// RECEIVED opens the gate; REJECTED/CANCELLED files are ignored.
function computeDeliveryOrderDocumentsCompletion(deliveryOrderId, deliveryOrderDocuments, requiredTypes = REQUIRED_DO_DOCUMENT_TYPES) {
    const byType = new Map();
    for (const doc of deliveryOrderDocuments || []) {
        if (doc.delivery_order_id !== deliveryOrderId) continue;
        if (doc.status === "REJECTED" || doc.status === "CANCELLED") continue;
        const list = byType.get(doc.document_type) || [];
        list.push(doc);
        byType.set(doc.document_type, list);
    }
    const documents_outstanding = [];
    const documents_unverified = [];
    for (const type of requiredTypes) {
        const list = byType.get(type) || [];
        if (list.length === 0) {
            documents_outstanding.push(type);
        } else if (!list.some((doc) => doc.status === "VERIFIED")) {
            documents_unverified.push(type);
        }
    }
    return {
        documents_complete: documents_outstanding.length === 0,
        documents_outstanding,
        documents_unverified
    };
}

function computeDeliveryOrderActualEntry(shipments, dtos) {
    const shipmentIds = new Set((shipments || []).map((shipment) => shipment.id));
    const deliveredDates = dtos
        .filter((dto) => shipmentIds.has(dto.shipment_id)
            && (dto.status === "POD_RECEIVED" || dto.status === "CLOSED")
            && dto.actual_delivery_at)
        .map((dto) => dto.actual_delivery_at)
        .sort();
    return deliveredDates.length ? toDateOnlyValue(deliveredDates[deliveredDates.length - 1]) : null;
}

function buildDeliveryOrderScreen(enrichedDeliveryOrder, lots, extras) {
    const purchaseOrder = enrichedDeliveryOrder.purchase_order || null;
    const supplier = purchaseOrder?.supplier || null;
    const lines = enrichedDeliveryOrder.lines || [];
    const firstLot = lots[0] || null;
    const firstLotNo = firstLot?.lot_no || firstLot?.lot?.lot_no || null;
    const orderNo = enrichedDeliveryOrder.delivery_order_no || enrichedDeliveryOrder.do_no || enrichedDeliveryOrder.id;
    const sourceLines = lines.map((line) => buildDeliveryOrderSourceLine(enrichedDeliveryOrder, line, purchaseOrder, orderNo));
    const firstLine = sourceLines[0] || null;
    const totalQuantity = sourceLines.reduce((total, line) => total + (Number(line.quantity) || 0), 0);
    const plannedEta = toDateOnlyValue(enrichedDeliveryOrder.planned_eta);
    const plannedEtd = toDateOnlyValue(enrichedDeliveryOrder.planned_etd);
    const plannedCargoReady = toDateOnlyValue(enrichedDeliveryOrder.planned_cargo_ready_date);
    const warehouseDeadline = plannedEta || plannedCargoReady || plannedEtd || toDateOnlyValue(enrichedDeliveryOrder.create_at);
    const shippingMethod = inferDeliveryOrderShippingMethod(enrichedDeliveryOrder);
    const requiredDocumentTypes = extras.requiredDocumentTypes || REQUIRED_DO_DOCUMENT_TYPES;
    const documentsCompletion = computeDeliveryOrderDocumentsCompletion(enrichedDeliveryOrder.id, extras.deliveryOrderDocuments, requiredDocumentTypes);

    return {
        id: enrichedDeliveryOrder.id,
        order_info: {
            request_code: purchaseOrder?.po_no || orderNo,
            order_number: orderNo,
            tracking_number: null,
            purchase_contract_number: purchaseOrder?.contract_no || "",
            status: resolveDeliveryOrderScreenStatus(enrichedDeliveryOrder),
            notes: enrichedDeliveryOrder.notes || "",
            xnk_notes: ""
        },
        product_details: {
            item_name_requested: firstLine?.item_name || "",
            unit: firstLine?.unit || "",
            quantity: totalQuantity,
            lot_number: firstLotNo,
            lot_unit_quantity: firstLot ? totalQuantity : null,
            lot_unit_type: firstLine?.unit || null,
            packaging_type: null
        },
        source_lines: sourceLines,
        sap_integration: {
            supplier_code: supplier?.supplier_code || null,
            supplier_name: supplier?.supplier_name || null,
            actual_item_code: firstLine?.item_code || null,
            raw_date: toDateOnlyValue(enrichedDeliveryOrder.create_at),
            po_number: purchaseOrder?.po_no || null,
            sync_status: "SYNCED"
        },
        source_po_number: purchaseOrder?.po_no,
        source_lot_id: firstLot?.po_lot_id,
        source_lot_no: firstLotNo || undefined,
        linked_shipment_number: enrichedDeliveryOrder.linked_shipment_number || enrichedDeliveryOrder.shipments?.[0]?.shipment_no || null,
        logistics_shipping: {
            incoterms: purchaseOrder?.incoterm?.incoterm_code || "",
            shipping_method: shippingMethod,
            shipping_line: null,
            vessel_code: null,
            port_of_departure: enrichedDeliveryOrder.origin_address || "",
            port_of_destination: resolveDeliveryOrderDestinationPort(enrichedDeliveryOrder, firstLot, shippingMethod),
            documents_list: computeDeliveryOrderDocumentsList(enrichedDeliveryOrder.id, extras.deliveryOrderDocuments, requiredDocumentTypes),
            missing_documents: computeDeliveryOrderMissingDocuments(enrichedDeliveryOrder.shipments, extras.shipmentDocuments),
            required_documents: requiredDocumentTypes,
            documents_complete: documentsCompletion.documents_complete,
            documents_outstanding: documentsCompletion.documents_outstanding,
            documents_unverified: documentsCompletion.documents_unverified,
            cut_off_date: null,
            etd_planned: plannedEtd || null,
            eta_planned: plannedEta || null
        },
        warehouse_tracking: {
            warehouse_code: enrichedDeliveryOrder.warehouse_name || "",
            production_ready_date: plannedCargoReady || null,
            warehouse_deadline: warehouseDeadline,
            planned_entry_date: plannedEta || null,
            actual_entry_date: computeDeliveryOrderActualEntry(enrichedDeliveryOrder.shipments, extras.domesticTransportOrders),
            delay_days: 0
        },
        finance_tax: {
            import_tax_rate: null,
            tax_amount: null,
            currency: purchaseOrder?.currency?.currency_code || "USD",
            tax_payment_deadline: null,
            insurance: null
        },
        task_summary: computeDeliveryOrderTaskSummary(orderNo, extras.logisticsTasks),
        flow_tags: lots.length > 1 ? ["PARTIAL_DELIVERY"] : ["LINEAR"]
    };
}

export async function getDeliveryOrderScreen(id) {
    const [enriched, lots, logisticsTasks, shipmentDocuments, domesticTransportOrders, deliveryOrderDocuments, requiredDocumentTypes] = await Promise.all([
        getDeliveryOrder(id),
        listDeliveryOrderLots(id),
        active(collections.logisticsTasks),
        active(collections.shipmentDocuments),
        active(collections.domesticTransportOrders),
        active(collections.deliveryOrderDocuments),
        getRequiredDocumentTypeCodes()
    ]);
    return buildDeliveryOrderScreen(enriched, lots, { logisticsTasks, shipmentDocuments, domesticTransportOrders, deliveryOrderDocuments, requiredDocumentTypes });
}

export async function listDeliveryOrderScreens() {
    const [deliveryOrders, doLots, doLines, allLots, context, logisticsTasks, shipmentDocuments, domesticTransportOrders, deliveryOrderDocuments, requiredDocumentTypes] = await Promise.all([
        active(collections.deliveryOrders),
        active(collections.deliveryOrderLots),
        active(collections.deliveryOrderLines),
        active(collections.lots),
        getPurchaseOrderContext(),
        active(collections.logisticsTasks),
        active(collections.shipmentDocuments),
        active(collections.domesticTransportOrders),
        active(collections.deliveryOrderDocuments),
        getRequiredDocumentTypeCodes()
    ]);
    const extras = { logisticsTasks, shipmentDocuments, domesticTransportOrders, deliveryOrderDocuments, requiredDocumentTypes };
    return deliveryOrders.map((deliveryOrder) => {
        const enriched = {
            ...enrichDeliveryOrder(deliveryOrder, context),
            lines: doLines
                .filter((line) => line.delivery_order_id === deliveryOrder.id)
                .sort(bySortOrder)
                .map((line) => enrichDeliveryOrderLine(line, context))
        };
        const lots = doLots
            .filter((row) => row.delivery_order_id === deliveryOrder.id)
            .map((row) => ({ ...row, lot: allLots.find((lot) => lot.id === row.po_lot_id) || null }));
        return buildDeliveryOrderScreen(enriched, lots, extras);
    });
}

const deliveryOrderDocumentStatuses = ["DRAFT", "RECEIVED", "WAITING_REVIEW", "APPROVED", "VERIFIED", "REJECTED", "CANCELLED"];

export async function listDeliveryOrderDocuments(id) {
    await requireRecord(collections.deliveryOrders, id, "Delivery order not found");
    return (await active(collections.deliveryOrderDocuments)).filter((doc) => doc.delivery_order_id === id);
}

export async function createDeliveryOrderDocument(id, body) {
    await requireRecord(collections.deliveryOrders, id, "Delivery order not found");
    if (body.status && !deliveryOrderDocumentStatuses.includes(body.status)) {
        throw apiError("VALIDATION_ERROR", "Invalid document status", { status: body.status }, 400);
    }
    const [documents, requiredTypes] = await Promise.all([
        active(collections.deliveryOrderDocuments),
        getRequiredDocumentTypeCodes()
    ]);
    const documentType = body.document_type || "OTHER";
    return repo.insert(collections.deliveryOrderDocuments, {
        id: nextId(documents, "do_doc"),
        delivery_order_id: id,
        document_type: documentType,
        document_no: body.document_no || null,
        file_url: body.file_url || null,
        file_name: body.file_name || null,
        mime_type: body.mime_type || null,
        received_at: body.received_at || null,
        status: body.status || "RECEIVED",
        is_required: requiredTypes.includes(documentType),
        notes: body.notes || null
    });
}

export async function updateDeliveryOrderDocument(documentId, body) {
    await requireRecord(collections.deliveryOrderDocuments, documentId, "Delivery order document not found");
    if (body.status && !deliveryOrderDocumentStatuses.includes(body.status)) {
        throw apiError("VALIDATION_ERROR", "Invalid document status", { status: body.status }, 400);
    }
    const allowedFields = ["document_type", "document_no", "file_url", "file_name", "mime_type", "received_at", "status", "notes"];
    const patch = pick(body, allowedFields);
    if (patch.document_type) {
        const requiredTypes = await getRequiredDocumentTypeCodes();
        patch.is_required = requiredTypes.includes(patch.document_type);
    }
    return repo.update(collections.deliveryOrderDocuments, documentId, patch);
}

export async function deleteDeliveryOrderDocument(documentId) {
    const deleted = await repo.softDelete(collections.deliveryOrderDocuments, documentId);
    if (!deleted) {
        throw apiError("NOT_FOUND", "Delivery order document not found", { id: documentId }, 404);
    }
    return deleted;
}

export async function markDeliveryOrderReadyForQuotation(id) {
    return updateDeliveryOrderStatus(id, "READY_FOR_QUOTATION");
}

export async function cancelDeliveryOrder(id) {
    return updateDeliveryOrderStatus(id, "CANCELLED");
}

export async function updateDeliveryOrder(id, body) {
    await requireRecord(collections.deliveryOrders, id, "Delivery order not found");
    const allowedFields = [
        "delivery_order_no",
        "purchase_order_id",
        "transport_mode_id",
        "status",
        "requested_pickup_date",
        "planned_cargo_ready_date",
        "planned_etd",
        "planned_eta",
        "origin_address",
        "destination_address",
        "warehouse_name",
        "requested_by",
        "handled_by",
        "notes"
    ];
    const patch = Object.fromEntries(
        Object.entries(pick(body, allowedFields)).filter(([, value]) => value !== undefined)
    );

    await repo.update(collections.deliveryOrders, id, patch);
    return getDeliveryOrder(id);
}

// Standalone (pre-PO) freight quotation. In the reversed flow a quotation is the
// entry point: FDS quotes a customer's shipment BEFORE any PO/DO exists, so it
// carries its own customer_ref + incoterm_code + mode + charge lines and is not
// bound to a DO (ref_type/ref_id stay null until later). Confirming it opens the
// gate to create a PO (see createPurchaseOrder).
export async function createQuotation(body = {}) {
    const [quotations, chargeLines] = await Promise.all([
        active(collections.quotations),
        active(collections.quotationChargeLines)
    ]);
    const newId = nextId(quotations, "qt");
    const groupId = body.quotation_group_id || `qg_${newId}`;
    const initialStatus = body.status || "DRAFT";

    const quotation = await repo.insert(collections.quotations, {
        id: newId,
        quotation_group_id: groupId,
        quotation_no: body.quotation_no || nextDocumentNo("QT-KBI-2026", quotations, "quotation_no"),
        version: 1,
        ref_type: body.ref_type || null,
        ref_id: body.ref_id || null,
        customer_ref: body.customer_ref || null,
        supplier_id: body.supplier_id || "sup_001",
        quotation_type: body.quotation_type || "FREIGHT",
        incoterm_code: body.incoterm_code || null,
        mode: body.mode || null,
        rfq_id: body.rfq_id || null,
        origin_port: body.origin_port || null,
        destination_port: body.destination_port || null,
        selected_option_id: body.selected_option_id || null,
        currency_code: body.currency_code || "USD",
        currency_id: body.currency_id || null,
        exchange_rate: body.exchange_rate || 25000,
        status: initialStatus,
        is_final: false,
        quoted_at: body.quoted_at ?? (initialStatus !== "DRAFT" ? new Date().toISOString() : null),
        valid_until: body.valid_until || null,
        note: body.note || null
    });

    const sourceChargeLines = Array.isArray(body.charge_lines) ? body.charge_lines : [];
    const start = nextNumber(chargeLines, "qt_line");
    for (const [index, line] of sourceChargeLines.entries()) {
        const quantity = Number(line.quantity ?? 1);
        const unitPrice = Number(line.unit_price ?? line.amount ?? 0);
        const amount = Number(line.amount ?? quantity * unitPrice);
        const taxRate = 0;
        const taxAmount = 0;
        await repo.insert(collections.quotationChargeLines, {
            id: formatId("qt_line", start + index),
            quotation_id: quotation.id,
            line_no: line.line_no ?? index + 1,
            charge_type: line.charge_type || "OTHER",
            charge_code: line.charge_code || null,
            charge_group: line.charge_group || null,
            option_no: line.option_no ?? null,
            description: line.description || null,
            quantity,
            unit: line.unit || "SET",
            unit_price: unitPrice,
            amount,
            currency_code: line.currency_code || quotation.currency_code,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total_amount: amount,
            note: line.note || null
        });
    }

    return getQuotation(quotation.id);
}

async function enrichQuotationRequest(request, context = {}) {
    const [lines, quotations, suppliers, items] = await Promise.all([
        context.lines ? Promise.resolve(context.lines) : active(collections.quotationRequestLines),
        context.quotations ? Promise.resolve(context.quotations) : active(collections.quotations),
        context.suppliers ? Promise.resolve(context.suppliers) : active(collections.suppliers),
        context.items ? Promise.resolve(context.items) : active(collections.items)
    ]);
    const requestLines = lines
        .filter((line) => line.quotation_request_id === request.id)
        .sort((left, right) => Number(left.line_no || 0) - Number(right.line_no || 0))
        .map((line) => ({
            ...line,
            item: items.find((item) => item.id === line.item_id) || null
        }));

    return {
        ...request,
        supplier: suppliers.find((supplier) => supplier.id === request.supplier_id) || null,
        lines: requestLines,
        quotations: await Promise.all(
            quotations
                .filter((quotation) => quotation.rfq_id === request.id)
                .map((quotation) => getQuotation(quotation.id))
        )
    };
}

async function syncRfqStatusFromQuotation(quotation) {
    if (!quotation?.rfq_id) return null;

    const request = await repo.findById(collections.quotationRequests, quotation.rfq_id);
    if (!request || request.status === "CANCELLED") return request;

    const nextStatusByQuotationStatus = {
        DRAFT: "RECEIVED",
        PENDING_APPROVAL: "QUOTED",
        PENDING_ADJUSTMENT: "QUOTED",
        CONFIRMED: "CONFIRMED",
        REJECTED: "QUOTED"
    };
    const nextStatus = nextStatusByQuotationStatus[quotation.status];
    if (!nextStatus) return request;
    if (request.status === "CONFIRMED" && nextStatus !== "CONFIRMED") return request;
    if (request.status === nextStatus) return request;

    return repo.update(collections.quotationRequests, request.id, { status: nextStatus });
}

export async function listQuotationRequests(query = {}) {
    const [quotationRequests, quotationLines, quotations, suppliers, items] = await Promise.all([
        active(collections.quotationRequests),
        active(collections.quotationRequestLines),
        active(collections.quotations),
        active(collections.suppliers),
        active(collections.items)
    ]);
    const search = searchTerm(query);

    const matchedRequests = quotationRequests
        .filter((request) => {
            if (query.status && request.status !== query.status) return false;
            if (!search) return true;
            const supplier = suppliers.find((row) => row.id === request.supplier_id) || {};
            return [
                request.rfq_no,
                request.customer_ref,
                request.customer_po_ref,
                request.customer_contract_ref,
                supplier.supplier_code,
                supplier.supplier_name
            ].some((value) => String(value || "").toLowerCase().includes(search));
        })
        .sort((left, right) => String(right.create_at || "").localeCompare(String(left.create_at || "")));

    const enriched = await Promise.all(matchedRequests.map((request) => enrichQuotationRequest(request, {
        lines: quotationLines,
        quotations,
        suppliers,
        items
    })));
    return paginateResult(enriched, query);
}

export async function getQuotationRequest(id) {
    const request = await requireRecord(collections.quotationRequests, id, "Quotation request not found");
    return enrichQuotationRequest(request);
}

export async function createQuotationRequest(body = {}) {
    const [quotationRequests, quotationLines] = await Promise.all([
        active(collections.quotationRequests),
        active(collections.quotationRequestLines)
    ]);
    const now = new Date().toISOString();
    const request = await repo.insert(collections.quotationRequests, {
        id: nextBusinessId(quotationRequests, "qr"),
        rfq_no: body.rfq_no || nextRfqNo(quotationRequests),
        status: "SUBMITTED",
        customer_ref: body.customer_ref || null,
        customer_po_ref: body.customer_po_ref || null,
        customer_contract_ref: body.customer_contract_ref || null,
        supplier_id: body.supplier_id || null,
        incoterm_code: body.incoterm_code || null,
        mode: body.mode || null,
        currency_code: body.currency_code || "USD",
        origin_port: body.origin_port || null,
        destination_port: body.destination_port || null,
        desired_cargo_ready_date: body.desired_cargo_ready_date || null,
        gross_weight_kg: body.gross_weight_kg ?? null,
        volume_cbm: body.volume_cbm ?? null,
        container_type: body.container_type || null,
        note: body.note || null,
        create_at: now,
        update_at: now,
        delete_at: null,
        is_delete: false
    });

    const nextLineNumber = nextBusinessId(quotationLines, "qrl");
    const nextLineStart = Number(String(nextLineNumber).match(/(\d+)$/)?.[1] || 1);
    for (const [index, line] of (Array.isArray(body.lines) ? body.lines : []).entries()) {
        await repo.insert(collections.quotationRequestLines, {
            id: `qrl-${String(nextLineStart + index).padStart(4, "0")}`,
            quotation_request_id: request.id,
            line_no: line.line_no ?? index + 1,
            item_id: line.item_id || null,
            item_description: line.item_description || null,
            qty: Number(line.qty ?? 0),
            unit: line.unit || null,
            unit_price: line.unit_price ?? null,
            gross_weight_kg: line.gross_weight_kg ?? null,
            length_cm: line.length_cm ?? null,
            width_cm: line.width_cm ?? null,
            height_cm: line.height_cm ?? null,
            cbm: line.cbm ?? null,
            note: line.note || null,
            create_at: now,
            update_at: now,
            delete_at: null,
            is_delete: false
        });
    }

    return getQuotationRequest(request.id);
}

export async function receiveQuotationRequest(id) {
    const request = await requireRecord(collections.quotationRequests, id, "Quotation request not found");
    if (request.status !== "SUBMITTED") {
        throw apiError("STATE_CONFLICT", "RFQ must be SUBMITTED to receive", { id, status: request.status }, 409);
    }
    await repo.update(collections.quotationRequests, id, { status: "RECEIVED" });
    return getQuotationRequest(id);
}

export async function cancelQuotationRequest(id) {
    const request = await requireRecord(collections.quotationRequests, id, "Quotation request not found");
    if (request.status === "CONFIRMED") {
        throw apiError("STATE_CONFLICT", "Confirmed RFQ cannot be cancelled", { id, status: request.status }, 409);
    }
    await repo.update(collections.quotationRequests, id, { status: "CANCELLED" });
    return getQuotationRequest(id);
}

export async function createQuotationFromRequest(id, body = {}) {
    const request = await requireRecord(collections.quotationRequests, id, "Quotation request not found");
    if (request.status === "CANCELLED") {
        throw apiError("STATE_CONFLICT", "Cancelled RFQ cannot create a quotation", { id, status: request.status }, 409);
    }
    const quotation = await createQuotation({
        ...body,
        rfq_id: id,
        customer_ref: request.customer_ref,
        supplier_id: request.supplier_id,
        incoterm_code: request.incoterm_code,
        mode: request.mode,
        currency_code: request.currency_code || body.currency_code || "USD",
        origin_port: request.origin_port,
        destination_port: request.destination_port,
        status: "DRAFT"
    });
    await syncRfqStatusFromQuotation(quotation);
    return quotation;
}

export async function createQuotationForDeliveryOrder(deliveryOrderId, body) {
    const deliveryOrder = await requireRecord(collections.deliveryOrders, deliveryOrderId, "Delivery order not found");
    const [quotations, chargeLines] = await Promise.all([
        active(collections.quotations),
        active(collections.quotationChargeLines)
    ]);
    const groupId = body.quotation_group_id || `qg_${deliveryOrder.id}`;

    const quotation = await repo.insert(collections.quotations, {
        id: nextId(quotations, "qt"),
        quotation_group_id: groupId,
        quotation_no: body.quotation_no || nextDocumentNo("QT-KBI-2026", quotations, "quotation_no"),
        version: quotations.filter((quotation) => quotation.quotation_group_id === groupId).length + 1,
        ref_type: "DELIVERY_ORDER",
        ref_id: deliveryOrder.id,
        supplier_id: body.supplier_id || "sup_001",
        quotation_type: body.quotation_type || "FREIGHT",
        rfq_id: body.rfq_id || null,
        origin_port: body.origin_port || null,
        destination_port: body.destination_port || null,
        selected_option_id: body.selected_option_id || null,
        currency_code: body.currency_code || "USD",
        exchange_rate: body.exchange_rate || 25000,
        status: "DRAFT",
        is_final: false,
        quoted_at: body.quoted_at || new Date().toISOString(),
        valid_until: body.valid_until || null,
        note: body.note || null
    });

    const sourceChargeLines = Array.isArray(body.charge_lines) && body.charge_lines.length > 0
        ? body.charge_lines
        : [
            {
                charge_type: "OCEAN_FREIGHT",
                description: "Mock freight charge",
                quantity: 1,
                unit_price: 1000,
                currency_code: quotation.currency_code,
                tax_rate: 0,
                note: null
            }
        ];
    const start = nextNumber(chargeLines, "qt_line");

    for (const [index, line] of sourceChargeLines.entries()) {
        const quantity = Number(line.quantity ?? 1);
        const unitPrice = Number(line.unit_price ?? line.amount ?? 0);
        const amount = Number(line.amount ?? quantity * unitPrice);
        const taxRate = 0;
        const taxAmount = 0;
        await repo.insert(collections.quotationChargeLines, {
            id: formatId("qt_line", start + index),
            quotation_id: quotation.id,
            line_no: line.line_no ?? index + 1,
            charge_type: line.charge_type || "OTHER",
            charge_code: line.charge_code || null,
            charge_group: line.charge_group || null,
            option_no: line.option_no ?? null,
            description: line.description || null,
            quantity,
            unit: line.unit || "SET",
            unit_price: unitPrice,
            amount,
            currency_code: line.currency_code || quotation.currency_code,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total_amount: amount,
            note: line.note || null
        });
    }

    return getQuotation(quotation.id);
}

export async function markQuotationFinal(id) {
    const quotation = await requireRecord(collections.quotations, id, "Quotation not found");
    if (quotation.status !== "PENDING_APPROVAL") {
        throw apiError(
            "STATE_CONFLICT",
            "Quotation must be PENDING_APPROVAL to confirm",
            { quotation_id: id, status: quotation.status },
            409
        );
    }
    if (!quotation.selected_option_id) {
        throw apiError(
            "BUSINESS_RULE_VIOLATION",
            "Select a quotation option before confirming",
            { quotation_id: id },
            409
        );
    }
    const quotations = await active(collections.quotations);
    for (const row of quotations.filter((item) => item.quotation_group_id === quotation.quotation_group_id)) {
        const isSelected = row.id === id;
        await repo.update(collections.quotations, row.id, {
            is_final: isSelected,
            confirmed_at: isSelected ? new Date().toISOString() : row.confirmed_at || null,
            status: isSelected
                ? "CONFIRMED"
                : row.status === "CONFIRMED"
                    ? "DRAFT"
                    : row.status
        });
    }

    const events = await active(collections.quotationEvents);
    await repo.insert(collections.quotationEvents, {
        id: nextId(events, "qt_event"),
        quotation_id: id,
        event_code: "MARK_FINAL",
        event_at: new Date().toISOString(),
        note: "Marked final in mock flow."
    });

    await syncRfqStatusFromQuotation({ ...quotation, status: "CONFIRMED" });

    return getQuotation(id);
}

export async function listQuotations(query = {}) {
    const [quotations, suppliers] = await Promise.all([
        active(collections.quotations),
        active(collections.suppliers)
    ]);
    const search = searchTerm(query);

    const matchedQuotations = quotations
        .filter((quotation) => {
            if (query.ref_type && quotation.ref_type !== query.ref_type) return false;
            if (query.ref_id && quotation.ref_id !== query.ref_id) return false;
            if (query.status && quotation.status !== query.status) return false;
            if (query.supplier_id && quotation.supplier_id !== query.supplier_id) return false;
            if (query.from_date && String(quotation.quoted_at || "") < String(query.from_date)) return false;
            if (query.to_date && String(quotation.quoted_at || "") > String(query.to_date)) return false;
            if (!search) return true;

            const supplier = suppliers.find((row) => row.id === quotation.supplier_id) || {};
            return [
                quotation.quotation_no,
                quotation.ref_type,
                quotation.ref_id,
                quotation.status,
                quotation.quotation_type,
                quotation.currency_code,
                quotation.note,
                supplier.supplier_code,
                supplier.supplier_name
            ].some((value) => String(value || "").toLowerCase().includes(search));
        })
        .sort((left, right) => String(right.create_at || "").localeCompare(String(left.create_at || "")));

    const items = await Promise.all(matchedQuotations.map((quotation) => getQuotation(quotation.id)));
    return paginateResult(items, query);
}

export async function listQuotationsByDeliveryOrder(deliveryOrderId) {
    await requireRecord(collections.deliveryOrders, deliveryOrderId, "Delivery order not found");
    const quotations = (await active(collections.quotations)).filter((quotation) => (
        quotation.ref_type === "DELIVERY_ORDER" && quotation.ref_id === deliveryOrderId
    ));

    return Promise.all(quotations.map((quotation) => getQuotation(quotation.id)));
}

export async function createQuotationVersion(id, body = {}) {
    const source = await requireRecord(collections.quotations, id, "Quotation not found");
    const [quotations, chargeLines] = await Promise.all([
        active(collections.quotations),
        active(collections.quotationChargeLines)
    ]);
    const groupQuotations = quotations.filter((quotation) => quotation.quotation_group_id === source.quotation_group_id);
    const nextVersion = maxNumber(groupQuotations, "version") + 1;
    const versionStatus = body.status || "DRAFT";
    const quotation = await repo.insert(collections.quotations, {
        ...source,
        id: nextId(quotations, "qt"),
        quotation_no: body.quotation_no || `${source.quotation_no}-V${nextVersion}`,
        version: nextVersion,
        status: versionStatus,
        is_final: false,
        quoted_at: body.quoted_at ?? (versionStatus !== "DRAFT" ? new Date().toISOString() : null),
        valid_until: body.valid_until ?? source.valid_until,
        note: body.note ?? source.note,
        // Header overrides — when the caller supplies edited values, prefer them over the source clone
        customer_ref: body.customer_ref !== undefined ? body.customer_ref : source.customer_ref,
        incoterm_code: body.incoterm_code !== undefined ? body.incoterm_code : source.incoterm_code,
        mode: body.mode !== undefined ? body.mode : source.mode,
        rfq_id: body.rfq_id !== undefined ? body.rfq_id : source.rfq_id || null,
        origin_port: body.origin_port !== undefined ? body.origin_port : source.origin_port || null,
        destination_port: body.destination_port !== undefined ? body.destination_port : source.destination_port || null,
        selected_option_id: null,
        currency_code: body.currency_code !== undefined ? body.currency_code : source.currency_code
    });
    const start = nextNumber(chargeLines, "qt_line");

    if (Array.isArray(body.charge_lines)) {
        // Caller supplied edited lines — compute amounts exactly like createQuotation
        for (const [index, line] of body.charge_lines.entries()) {
            const quantity = Number(line.quantity ?? 1);
            const unitPrice = Number(line.unit_price ?? line.amount ?? 0);
            const amount = Number(line.amount ?? quantity * unitPrice);
            const taxRate = 0;
            const taxAmount = 0;
            await repo.insert(collections.quotationChargeLines, {
                id: formatId("qt_line", start + index),
                quotation_id: quotation.id,
                line_no: line.line_no ?? index + 1,
                charge_type: line.charge_type || "OTHER",
                charge_code: line.charge_code || null,
                charge_group: line.charge_group || null,
                option_no: line.option_no ?? null,
                description: line.description || null,
                quantity,
                unit: line.unit || "SET",
                unit_price: unitPrice,
                amount,
                currency_code: line.currency_code || quotation.currency_code,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                total_amount: amount,
                note: line.note || null
            });
        }
    } else {
        // No lines supplied — copy from the source quotation (plain "duplicate" behaviour)
        const copiedChargeLines = chargeLines.filter((line) => line.quotation_id === source.id);
        for (const [index, line] of copiedChargeLines.entries()) {
            await repo.insert(collections.quotationChargeLines, {
                ...line,
                id: formatId("qt_line", start + index),
                quotation_id: quotation.id
            });
        }
    }

    return getQuotation(quotation.id);
}

export async function confirmQuotationByKbi(id) {
    return markQuotationFinal(id);
}

export async function rejectQuotation(id, body = {}) {
    const quotation = await requireRecord(collections.quotations, id, "Quotation not found");
    if (quotation.status !== "PENDING_APPROVAL") {
        throw apiError(
            "STATE_CONFLICT",
            "Quotation must be PENDING_APPROVAL to reject",
            { quotation_id: id, status: quotation.status },
            409
        );
    }
    return updateQuotationStatus(id, "REJECTED", { reject_reason: body.reason || body.reject_reason || null });
}

export async function cancelQuotation(id, body = {}) {
    return updateQuotationStatus(id, "REJECTED", { reject_reason: body.reason || body.reject_reason || "Cancelled" });
}

// Forward quotation status transitions for the RFQ-backed flow
// (DRAFT -> PENDING_APPROVAL -> CONFIRMED, with PENDING_ADJUSTMENT/REJECTED).
// KBI raises the RFQ; FDS drafts (receive) then submits (submit-to-kbi); KBI
// confirms (mark-final) or rejects. Each enforces a legal from-state + event.
const quotationForwardTransitions = {
    PENDING_APPROVAL: { from: ["DRAFT", "PENDING_ADJUSTMENT"], event: "SUBMIT_TO_KBI" }
};

async function advanceQuotationStatus(id, targetStatus) {
    const quotation = await requireRecord(collections.quotations, id, "Quotation not found");
    const guard = quotationForwardTransitions[targetStatus];
    if (guard && !guard.from.includes(quotation.status)) {
        throw apiError(
            "STATE_CONFLICT",
            `Quotation must be ${guard.from.join(" or ")} to move to ${targetStatus}`,
            { id, status: quotation.status },
            409
        );
    }
    await repo.update(collections.quotations, id, { status: targetStatus });
    await syncRfqStatusFromQuotation({ ...quotation, status: targetStatus });
    const events = await active(collections.quotationEvents);
    await repo.insert(collections.quotationEvents, {
        id: nextId(events, "qt_event"),
        quotation_id: id,
        event_code: guard ? guard.event : targetStatus,
        event_at: new Date().toISOString(),
        note: `Quotation moved to ${targetStatus} in mock flow.`
    });
    return getQuotation(id);
}

export async function receiveQuotation(id) {
    const quotation = await requireRecord(collections.quotations, id, "Quotation not found");
    return getQuotation(quotation.id);
}

export async function submitQuotationToKbi(id) {
    return advanceQuotationStatus(id, "PENDING_APPROVAL");
}

export async function listQuotationOptions(id) {
    await requireRecord(collections.quotations, id, "Quotation not found");
    return (await active(collections.quotationOptions))
        .filter((option) => option.quotation_id === id)
        .sort((left, right) => Number(left.option_no || 0) - Number(right.option_no || 0));
}

export async function createQuotationOption(id, body = {}) {
    await requireRecord(collections.quotations, id, "Quotation not found");
    const options = await active(collections.quotationOptions);
    const quotationOptions = options.filter((option) => option.quotation_id === id);
    return repo.insert(collections.quotationOptions, {
        id: nextBusinessId(options, "qo"),
        quotation_id: id,
        option_no: maxNumber(quotationOptions, "option_no") + 1,
        carrier_code: body.carrier_code || null,
        carrier_name: body.carrier_name || null,
        mode: body.mode || null,
        vessel_or_flight: body.vessel_or_flight || null,
        voyage_flight_no: body.voyage_flight_no || null,
        etd: body.etd || null,
        eta: body.eta || null,
        transit_time_days: body.transit_time_days ?? null,
        risk_warning: body.risk_warning || null,
        headline_amount: body.headline_amount ?? null,
        is_recommended: Boolean(body.is_recommended),
        is_selected: false
    });
}

export async function updateQuotationOption(optionId, body = {}) {
    await requireRecord(collections.quotationOptions, optionId, "Quotation option not found");
    const allowedFields = [
        "carrier_code",
        "carrier_name",
        "mode",
        "vessel_or_flight",
        "voyage_flight_no",
        "etd",
        "eta",
        "transit_time_days",
        "risk_warning",
        "headline_amount",
        "is_recommended",
        "is_selected"
    ];
    return repo.update(collections.quotationOptions, optionId, pick(body, allowedFields));
}

export async function deleteQuotationOption(optionId) {
    const deleted = await repo.softDelete(collections.quotationOptions, optionId);
    if (!deleted) {
        throw apiError("NOT_FOUND", "Quotation option not found", { id: optionId }, 404);
    }
    return deleted;
}

export async function selectQuotationOption(id, body = {}) {
    await requireRecord(collections.quotations, id, "Quotation not found");
    requireField(body, "option_id");
    const options = await active(collections.quotationOptions);
    const selected = options.find((option) => option.id === body.option_id && option.quotation_id === id);
    if (!selected) {
        throw apiError(
            "BUSINESS_RULE_VIOLATION",
            "Quotation option must belong to the quotation",
            { quotation_id: id, option_id: body.option_id },
            409
        );
    }

    for (const option of options.filter((row) => row.quotation_id === id)) {
        await repo.update(collections.quotationOptions, option.id, { is_selected: option.id === body.option_id });
    }
    await repo.update(collections.quotations, id, { selected_option_id: body.option_id });
    return getQuotation(id);
}

export async function listQuotationChargeLines(id) {
    await requireRecord(collections.quotations, id, "Quotation not found");
    return (await active(collections.quotationChargeLines)).filter((line) => line.quotation_id === id);
}

export async function createQuotationChargeLine(id, body) {
    await requireRecord(collections.quotations, id, "Quotation not found");
    const chargeLines = await active(collections.quotationChargeLines);
    const quantity = Number(body.quantity ?? 1);
    const unitPrice = Number(body.unit_price ?? body.amount ?? 0);
    const amount = Number(body.amount ?? quantity * unitPrice);
    const taxRate = 0;
    const taxAmount = 0;
    return repo.insert(collections.quotationChargeLines, {
        id: nextId(chargeLines, "qt_line"),
        quotation_id: id,
        line_no: body.line_no ?? chargeLines.filter((line) => line.quotation_id === id).length + 1,
        charge_type: body.charge_type || "OTHER",
        charge_code: body.charge_code || null,
        charge_group: body.charge_group || null,
        option_no: body.option_no ?? null,
        description: body.description || null,
        quantity,
        unit: body.unit || "SET",
        unit_price: unitPrice,
        amount,
        currency_code: body.currency_code || "USD",
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: amount,
        note: body.note || null
    });
}

export async function updateQuotationChargeLine(lineId, body) {
    const line = await requireRecord(collections.quotationChargeLines, lineId, "Quotation charge line not found");
    const allowedFields = ["line_no", "charge_type", "charge_code", "charge_group", "option_no", "description", "quantity", "unit", "unit_price", "amount", "currency_code", "tax_rate", "tax_amount", "total_amount", "note"];
    const patch = pick(body, allowedFields);
    const quantity = Number(patch.quantity ?? line.quantity ?? 1);
    const unitPrice = Number(patch.unit_price ?? line.unit_price ?? 0);
    const amount = Number(patch.amount ?? quantity * unitPrice);
    return repo.update(collections.quotationChargeLines, lineId, {
        ...patch,
        amount,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: amount
    });
}

export async function deleteQuotationChargeLine(lineId) {
    const deleted = await repo.softDelete(collections.quotationChargeLines, lineId);
    if (!deleted) {
        throw apiError("NOT_FOUND", "Quotation charge line not found", { id: lineId }, 404);
    }
    return deleted;
}

export async function negotiateQuotation(id, body = {}) {
    const quotation = await requireRecord(collections.quotations, id, "Quotation not found");
    const actorRole = String(body.actor_role || "").toUpperCase();
    if (!["KBI", "FDS"].includes(actorRole)) {
        throw apiError("VALIDATION_ERROR", "actor_role must be KBI or FDS", { actor_role: body.actor_role }, 400);
    }

    const expectedStatus = actorRole === "KBI" ? "PENDING_APPROVAL" : "PENDING_ADJUSTMENT";
    if (quotation.status !== expectedStatus) {
        throw apiError(
            "STATE_CONFLICT",
            `Quotation must be ${expectedStatus} for ${actorRole} negotiation`,
            { id, status: quotation.status, actor_role: actorRole },
            409
        );
    }

    const lines = Array.isArray(body.lines) ? body.lines : [];
    const validLines = lines.filter((line) => line?.charge_line_id && Number.isFinite(Number(line.proposed_unit_price)));
    if (validLines.length === 0) {
        throw apiError("VALIDATION_ERROR", "At least one changed line is required", { lines: body.lines }, 400);
    }

    const [allChargeLines, existingAdjustments] = await Promise.all([
        active(collections.quotationChargeLines),
        active(collections.quotationLineAdjustments)
    ]);
    const currentLines = allChargeLines.filter((line) => line.quotation_id === id);
    const roundNo = maxNumber(existingAdjustments.filter((row) => row.quotation_id === id), "round_no") + 1;
    const startAdjustmentNo = nextNumber(existingAdjustments, "qt_adj");
    const changedSummaries = [];

    for (const [index, linePatch] of validLines.entries()) {
        const chargeLine = currentLines.find((line) => line.id === linePatch.charge_line_id);
        if (!chargeLine) {
            throw apiError(
                "BUSINESS_RULE_VIOLATION",
                "Charge line must belong to the quotation",
                { quotation_id: id, charge_line_id: linePatch.charge_line_id },
                409
            );
        }

        const proposedUnitPrice = Number(linePatch.proposed_unit_price);
        const baseUnitPrice = Number(chargeLine.unit_price ?? 0);
        const status = proposedUnitPrice === baseUnitPrice
            ? "ACCEPTED"
            : actorRole === "FDS"
                ? "COUNTERED"
                : "PROPOSED";
        const amountPatch = buildChargeLineAmountPatch(chargeLine, proposedUnitPrice);

        await repo.insert(collections.quotationLineAdjustments, {
            id: formatId("qt_adj", startAdjustmentNo + index),
            quotation_id: id,
            charge_line_id: chargeLine.id,
            round_no: roundNo,
            actor_role: actorRole,
            base_unit_price: baseUnitPrice,
            proposed_unit_price: proposedUnitPrice,
            currency_code: chargeLine.currency_code || quotation.currency_code || null,
            note: linePatch.note || null,
            status
        });

        await repo.update(collections.quotationChargeLines, chargeLine.id, amountPatch);
        changedSummaries.push({
            charge_line_id: chargeLine.id,
            description: chargeLine.description || chargeLine.charge_type || null,
            base_unit_price: baseUnitPrice,
            proposed_unit_price: proposedUnitPrice,
            currency_code: chargeLine.currency_code || quotation.currency_code || null,
            delta_unit_price: roundNumber(proposedUnitPrice - baseUnitPrice),
            status
        });
    }

    const targetStatus = actorRole === "KBI" ? "PENDING_ADJUSTMENT" : "PENDING_APPROVAL";
    await repo.update(collections.quotations, id, { status: targetStatus });
    await syncRfqStatusFromQuotation({ ...quotation, status: targetStatus });
    const events = await active(collections.quotationEvents);
    await repo.insert(collections.quotationEvents, {
        id: nextId(events, "qt_event"),
        quotation_id: id,
        event_code: "NEGOTIATE",
        event_type: "NEGOTIATE",
        old_status: quotation.status,
        new_status: targetStatus,
        actor_name: actorRole,
        event_at: new Date().toISOString(),
        note: body.note || `Round ${roundNo}: ${actorRole} adjusted ${changedSummaries.length} line(s).`,
        payload: {
            round_no: roundNo,
            actor_role: actorRole,
            changed_line_count: changedSummaries.length,
            lines: changedSummaries
        }
    });

    return getQuotation(id);
}

export async function listQuotationEvents(id) {
    await requireRecord(collections.quotations, id, "Quotation not found");
    return (await active(collections.quotationEvents)).filter((event) => event.quotation_id === id);
}

export async function getQuotation(id) {
    const quotation = await requireRecord(collections.quotations, id, "Quotation not found");
    const [chargeLines, events, suppliers, currencies, options, adjustments, quotationRequests] = await Promise.all([
        active(collections.quotationChargeLines),
        active(collections.quotationEvents),
        active(collections.suppliers),
        active(collections.currencies),
        active(collections.quotationOptions),
        active(collections.quotationLineAdjustments),
        active(collections.quotationRequests)
    ]);
    const quotationChargeLines = chargeLines
        .filter((line) => line.quotation_id === id)
        .map((line, index) => enrichQuotationChargeLine(line, quotation, index));
    const rfq = quotation.rfq_id
        ? quotationRequests.find((request) => request.id === quotation.rfq_id)
        : null;

    return {
        ...quotation,
        rfq_no: rfq?.rfq_no ?? null,
        supplier: suppliers.find((supplier) => supplier.id === quotation.supplier_id) || null,
        currency: currencies.find((currency) => (
            currency.id === quotation.currency_id ||
            currency.currency_code === quotation.currency_code ||
            currency.id === quotation.currency_code
        )) || null,
        options: options
            .filter((option) => option.quotation_id === id)
            .sort((left, right) => Number(left.option_no || 0) - Number(right.option_no || 0)),
        charge_lines: quotationChargeLines,
        events: events.filter((event) => event.quotation_id === id),
        adjustments: adjustments
            .filter((adjustment) => adjustment.quotation_id === id)
            .sort((left, right) => (
                Number(left.round_no || 0) - Number(right.round_no || 0) ||
                String(left.create_at || "").localeCompare(String(right.create_at || ""))
            ))
    };
}

function buildChargeLineAmountPatch(line, unitPrice) {
    const quantity = Number(line.quantity ?? 1);
    const safeUnitPrice = Number(unitPrice || 0);
    const amount = roundNumber(quantity * safeUnitPrice);
    const taxRate = 0;
    const taxAmount = 0;

    return {
        unit_price: safeUnitPrice,
        amount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: amount
    };
}

function enrichQuotationChargeLine(line, quotation, index) {
    const quantity = Number(line.quantity ?? 1);
    const unitPrice = Number(line.unit_price ?? 0);
    const amount = Number(line.amount ?? quantity * unitPrice);
    const taxRate = 0;
    const taxAmount = 0;

    return {
        ...line,
        line_no: line.line_no ?? index + 1,
        unit: line.unit ?? "SET",
        currency_code: line.currency_code || quotation.currency_code || null,
        quantity,
        unit_price: unitPrice,
        amount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: amount
    };
}

export async function createShipmentFromDeliveryOrder(body) {
    requireField(body, "delivery_order_id");
    const deliveryOrder = await requireRecord(collections.deliveryOrders, body.delivery_order_id, "Delivery order not found");

    // Quotation no longer lives on the DO (reversed flow), so the old
    // QUOTATION_CONFIRMED gate is dropped. A shipment can be created from any DO
    // that is not terminal and not already assigned to a shipment.
    const shipmentBlockedDoStatuses = ["CANCELLED", "CLOSED", "ASSIGNED_TO_SHIPMENT"];
    if (shipmentBlockedDoStatuses.includes(deliveryOrder.status)) {
        throw apiError("BUSINESS_RULE_VIOLATION", `Shipment cannot be created from a delivery order in status ${deliveryOrder.status}`, { status: deliveryOrder.status }, 409);
    }

    const shipments = await active(collections.shipments);
    const requestedMode = normalizeShipmentModeForStorage(body.mode);
    const shipment = await repo.insert(collections.shipments, {
        id: nextId(shipments, "shp"),
        shipment_no: body.shipment_no || nextDocumentNo("SHP-KBI-2026", shipments, "shipment_no"),
        delivery_order_id: deliveryOrder.id,
        mode: requestedMode,
        load_type: body.load_type ?? inferShipmentLoadType(body.mode),
        forwarder_id: body.forwarder_id || null,
        carrier_id: body.carrier_id || null,
        carrier: body.carrier || null,
        vessel_flight: body.vessel_flight || null,
        bl_awb_no: body.bl_awb_no || null,
        container_no: body.container_no || null,
        pol: body.pol || "CNSHA",
        pod: body.pod || "VNHPH",
        etd: body.etd || null,
        eta: body.eta || null,
        atd: null,
        ata: null,
        status: "BOOKING_CONFIRMED"
    });
    const [deliveryOrderLines, shipmentLines, milestones] = await Promise.all([
        active(collections.deliveryOrderLines),
        active(collections.shipmentLines),
        active(collections.shipmentMilestones)
    ]);

    const selectedDeliveryOrderLines = deliveryOrderLines.filter((line) => line.delivery_order_id === deliveryOrder.id);
    const shipmentLineStart = nextNumber(shipmentLines, "shp_line");
    const milestoneStart = nextNumber(milestones, "ms");
    for (const [index, line] of selectedDeliveryOrderLines.entries()) {
        await repo.insert(collections.shipmentLines, {
            id: formatId("shp_line", shipmentLineStart + index),
            shipment_id: shipment.id,
            delivery_order_line_id: line.id,
            purchase_order_line_id: line.purchase_order_line_id,
            po_lot_id: line.po_lot_id,
            item_id: line.item_id,
            qty_shipped: line.qty,
            unit: line.unit,
            sort_order: index + 1
        });
    }

    for (const [index, code] of shipmentMilestoneCodes.entries()) {
        await repo.insert(collections.shipmentMilestones, {
            id: formatId("ms", milestoneStart + index),
            shipment_id: shipment.id,
            milestone_code: code,
            milestone_name: code.replaceAll("_", " "),
            status: index === 0 ? "DONE" : "PENDING",
            planned_at: null,
            actual_at: index === 0 ? new Date().toISOString() : null,
            sort_order: index + 1
        });
    }

    await repo.update(collections.deliveryOrders, deliveryOrder.id, {
        status: "ASSIGNED_TO_SHIPMENT"
    });

    return getShipment(shipment.id);
}

function normalizeShipmentModeForStorage(mode) {
    const normalized = String(mode || "SEA").toUpperCase();
    if (normalized.startsWith("SEA")) {
        return "SEA";
    }
    return normalized;
}

function inferShipmentLoadType(mode) {
    const normalized = String(mode || "").toUpperCase();
    if (normalized.includes("FCL")) return "FCL";
    if (normalized.includes("LCL")) return "LCL";
    if (normalized.includes("FTL")) return "FTL";
    if (normalized.includes("LTL")) return "LTL";
    return null;
}

export async function listShipments(query = {}) {
    const [shipments, deliveryOrders, purchaseOrders, declarations] = await Promise.all([
        active(collections.shipments),
        active(collections.deliveryOrders),
        active(collections.purchaseOrders),
        active(collections.customsDeclarations)
    ]);
    const search = searchTerm(query);

    const items = shipments
        .filter((shipment) => {
            const deliveryOrder = deliveryOrders.find((row) => row.id === shipment.delivery_order_id) || {};
            const purchaseOrder = purchaseOrders.find((row) => row.id === deliveryOrder.purchase_order_id) || {};

            if (query.status && shipment.status !== query.status) return false;
            if (query.mode && shipment.mode !== query.mode) return false;
            if (query.delivery_order_id && shipment.delivery_order_id !== query.delivery_order_id) return false;
            if (query.purchase_order_id && deliveryOrder.purchase_order_id !== query.purchase_order_id) return false;
            if (query.forwarder_id && shipment.forwarder_id !== query.forwarder_id) return false;
            if (query.transport_mode_id && shipment.transport_mode_id !== query.transport_mode_id) return false;
            if (query.from_date && String(shipment.etd || shipment.create_at || "") < String(query.from_date)) return false;
            if (query.to_date && String(shipment.etd || shipment.create_at || "") > String(query.to_date)) return false;
            if (!search) return true;

            return [
                shipment.shipment_no,
                shipment.carrier,
                shipment.vessel_flight,
                shipment.voyage_no,
                shipment.bl_awb_no,
                shipment.pol,
                shipment.pod,
                shipment.status,
                shipment.mode,
                deliveryOrder.delivery_order_no,
                purchaseOrder.po_no
            ].some((value) => String(value || "").toLowerCase().includes(search));
        })
        .sort((left, right) => String(right.create_at || "").localeCompare(String(left.create_at || "")))
        .map((shipment) => ({
            ...shipment,
            customs_channel: pickShipmentCustomsChannel(declarations, shipment.id)
        }));

    return paginateResult(items, query);
}

export async function getShipment(id) {
    const shipment = await requireRecord(collections.shipments, id, "Shipment not found");
    const [lines, milestones, documents, containers, declarations, costs, deliveryOrderDocuments, requiredDocumentTypes] = await Promise.all([
        active(collections.shipmentLines),
        active(collections.shipmentMilestones),
        active(collections.shipmentDocuments),
        active(collections.shipmentContainers),
        active(collections.customsDeclarations),
        active(collections.shipmentCosts),
        active(collections.deliveryOrderDocuments),
        getRequiredDocumentTypeCodes()
    ]);
    const finalQuotation = shipment.final_quotation_id ? await getQuotation(shipment.final_quotation_id) : null;
    // Mirror the parent DO's derived "documents complete" gate onto the shipment so the
    // milestone panel can show the badge without synthesizing it (source of truth = DO).
    const documentsCompletion = shipment.delivery_order_id
        ? computeDeliveryOrderDocumentsCompletion(shipment.delivery_order_id, deliveryOrderDocuments, requiredDocumentTypes)
        : { documents_complete: true, documents_outstanding: [], documents_unverified: [] };

    return {
        ...shipment,
        ...documentsCompletion,
        customs_channel: pickShipmentCustomsChannel(declarations, id),
        final_quotation: finalQuotation,
        lines: lines.filter((line) => line.shipment_id === id),
        milestones: milestones.filter((milestone) => milestone.shipment_id === id).sort(bySortOrder),
        documents: documents.filter((document) => document.shipment_id === id),
        containers: containers.filter((container) => container.shipment_id === id).sort(bySortOrder),
        costs: costs.filter((cost) => cost.shipment_id === id)
    };
}

export async function markShipmentMilestoneDone(shipmentId, code, body = {}) {
    const shipment = await requireRecord(collections.shipments, shipmentId, "Shipment not found");
    const milestones = await active(collections.shipmentMilestones);
    const milestone = milestones.find((row) => row.shipment_id === shipmentId && row.milestone_code === code);

    if (!milestone) {
        throw apiError("NOT_FOUND", "Shipment milestone not found", { code }, 404);
    }

    const actualAt = body.actual_at || new Date().toISOString();
    await repo.update(collections.shipmentMilestones, milestone.id, {
        status: "DONE",
        actual_at: actualAt,
        notes: body.notes ?? milestone.notes ?? null
    });
    // Mirror the departure/arrival milestones onto the shipment's atd/ata so the
    // PO logistics timeline (and any consumer reading firstShipment.atd/ata) shows
    // the actual dates. Warehouse ATA comes from the DTO's actual_delivery_at.
    const shipmentPatch = { status: shipmentStatusByMilestone[code] || code };
    if (code === "ATD") shipmentPatch.atd = actualAt;
    if (code === "ARRIVAL_NOTICE") shipmentPatch.ata = actualAt;
    await repo.update(collections.shipments, shipment.id, shipmentPatch);
    return getShipment(shipment.id);
}

export async function listShipmentLines(id) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    return (await active(collections.shipmentLines)).filter((line) => line.shipment_id === id).sort(bySortOrder);
}

export async function listShipmentMilestones(id) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    return (await active(collections.shipmentMilestones)).filter((milestone) => milestone.shipment_id === id).sort(bySortOrder);
}

export async function listShipmentDocuments(id) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    return (await active(collections.shipmentDocuments)).filter((document) => document.shipment_id === id);
}

export async function createShipmentDocument(id, body) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    const documents = await active(collections.shipmentDocuments);
    return repo.insert(collections.shipmentDocuments, {
        id: nextId(documents, "shp_doc"),
        shipment_id: id,
        milestone_id: body.milestone_id || null,
        milestone_code: body.milestone_code || null,
        document_type: body.document_type || "OTHER",
        document_no: body.document_no || null,
        file_url: body.file_url || null,
        file_name: body.file_name || null,
        mime_type: body.mime_type || null,
        issued_date: body.issued_date || null,
        received_at: body.received_at || null,
        status: body.status || "DRAFT",
        notes: body.notes || null
    });
}

export async function updateShipmentDocument(documentId, body) {
    await requireRecord(collections.shipmentDocuments, documentId, "Shipment document not found");
    const allowedFields = ["milestone_id", "milestone_code", "document_type", "document_no", "file_url", "file_name", "mime_type", "issued_date", "received_at", "status", "notes"];
    return repo.update(collections.shipmentDocuments, documentId, pick(body, allowedFields));
}

export async function deleteShipmentDocument(documentId) {
    const deleted = await repo.softDelete(collections.shipmentDocuments, documentId);
    if (!deleted) {
        throw apiError("NOT_FOUND", "Shipment document not found", { id: documentId }, 404);
    }
    return deleted;
}

const shipmentCostTypes = ["FREIGHT", "INSURANCE", "CUSTOMS_DUTY", "VAT", "LOCAL_CHARGES", "DEMURRAGE", "OTHER"];
const shipmentCostAllocMethods = ["BY_VALUE", "BY_WEIGHT", "BY_QTY"];

function assertShipmentCostBody(body) {
    if (body.cost_type && !shipmentCostTypes.includes(body.cost_type)) {
        throw apiError("VALIDATION_ERROR", "Invalid cost type", { cost_type: body.cost_type }, 400);
    }
    if (body.alloc_method && !shipmentCostAllocMethods.includes(body.alloc_method)) {
        throw apiError("VALIDATION_ERROR", "Invalid allocation method", { alloc_method: body.alloc_method }, 400);
    }
}

export async function listShipmentCosts(id) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    return (await active(collections.shipmentCosts)).filter((cost) => cost.shipment_id === id);
}

export async function createShipmentCost(id, body) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    assertShipmentCostBody(body);
    const costs = await active(collections.shipmentCosts);
    return repo.insert(collections.shipmentCosts, {
        id: nextId(costs, "shp_cost"),
        shipment_id: id,
        cost_type: body.cost_type || "OTHER",
        description: body.description || null,
        amount: body.amount ?? 0,
        currency_code: body.currency_code || "USD",
        exchange_rate: body.exchange_rate ?? 1,
        alloc_method: body.alloc_method || "BY_VALUE",
        invoice_ref: body.invoice_ref || null,
        notes: body.notes || null
    });
}

export async function updateShipmentCost(costId, body) {
    await requireRecord(collections.shipmentCosts, costId, "Shipment cost not found");
    assertShipmentCostBody(body);
    const allowedFields = ["cost_type", "description", "amount", "currency_code", "exchange_rate", "alloc_method", "invoice_ref", "notes"];
    return repo.update(collections.shipmentCosts, costId, pick(body, allowedFields));
}

export async function deleteShipmentCost(costId) {
    const deleted = await repo.softDelete(collections.shipmentCosts, costId);
    if (!deleted) {
        throw apiError("NOT_FOUND", "Shipment cost not found", { id: costId }, 404);
    }
    return deleted;
}

const containerStatuses = ["PLANNED", "STUFFED", "GATED_IN", "DISCHARGED", "RETURNED"];

export async function listShipmentContainers(id) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    return (await active(collections.shipmentContainers))
        .filter((container) => container.shipment_id === id)
        .sort(bySortOrder);
}

export async function createShipmentContainer(id, body) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    if (!body.container_no) {
        throw apiError("VALIDATION_ERROR", "container_no is required", {}, 400);
    }
    if (body.status && !containerStatuses.includes(body.status)) {
        throw apiError("VALIDATION_ERROR", "Invalid container status", { status: body.status }, 400);
    }
    const containers = await active(collections.shipmentContainers);
    const shipmentContainers = containers.filter((container) => container.shipment_id === id);
    return repo.insert(collections.shipmentContainers, {
        id: nextId(containers, "cont"),
        shipment_id: id,
        dto_id: body.dto_id || null,
        container_no: body.container_no,
        container_type: body.container_type || null,
        seal_no: body.seal_no || null,
        tare_weight_kg: body.tare_weight_kg ?? null,
        gross_weight_kg: body.gross_weight_kg ?? null,
        volume_cbm: body.volume_cbm ?? null,
        status: body.status || "PLANNED",
        note: body.note || null,
        sort_order: maxSort(shipmentContainers) + 1
    });
}

export async function updateShipmentContainer(containerId, body) {
    await requireRecord(collections.shipmentContainers, containerId, "Shipment container not found");
    if (body.status && !containerStatuses.includes(body.status)) {
        throw apiError("VALIDATION_ERROR", "Invalid container status", { status: body.status }, 400);
    }
    const allowedFields = [
        "dto_id",
        "container_no",
        "container_type",
        "seal_no",
        "tare_weight_kg",
        "gross_weight_kg",
        "volume_cbm",
        "status",
        "note",
        "sort_order"
    ];
    return repo.update(collections.shipmentContainers, containerId, pick(body, allowedFields));
}

export async function deleteShipmentContainer(containerId) {
    const deleted = await repo.softDelete(collections.shipmentContainers, containerId);
    if (!deleted) {
        throw apiError("NOT_FOUND", "Shipment container not found", { id: containerId }, 404);
    }
    return deleted;
}

export async function cancelShipment(id) {
    return updateShipmentStatus(id, "CANCELLED");
}

export async function updateShipment(id, body) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    const allowedFields = [
        "shipment_no",
        "delivery_order_id",
        "mode",
        "forwarder_id",
        "carrier",
        "carrier_id",
        "vessel_flight",
        "voyage_no",
        "bl_awb_no",
        "container_no",
        "pol",
        "pod",
        "etd",
        "eta",
        "atd",
        "ata",
        "status",
        "customs_channel",
        "final_quotation_id",
        "notes"
    ];
    const patch = Object.fromEntries(
        Object.entries(pick(body, allowedFields)).filter(([, value]) => value !== undefined)
    );

    await repo.update(collections.shipments, id, patch);
    return getShipment(id);
}

export async function createCustomsDeclaration(shipmentId, body) {
    const shipment = await requireRecord(collections.shipments, shipmentId, "Shipment not found");

    if (shipment.status === "CANCELLED") {
        throw apiError("BUSINESS_RULE_VIOLATION", "Cannot create customs declaration for cancelled shipment", {}, 409);
    }

    const [declarations, declarationLines, shipmentLines, items, profiles] = await Promise.all([
        active(collections.customsDeclarations),
        active(collections.customsDeclarationLines),
        active(collections.shipmentLines),
        active(collections.items),
        active(collections.itemCustomsProfiles)
    ]);
    const declaration = await repo.insert(collections.customsDeclarations, {
        id: nextId(declarations, "cd"),
        shipment_id: shipment.id,
        declaration_no: body.declaration_no || nextDocumentNo("CD-KBI-2026", declarations, "declaration_no"),
        customs_type: body.customs_type || "IMPORT",
        customs_channel: body.customs_channel || "GREEN",
        draft_opened_at: new Date().toISOString(),
        official_opened_at: null,
        cleared_at: null,
        status: "DRAFT",
        note: body.note || null
    });
    const selectedShipmentLines = shipmentLines.filter((line) => line.shipment_id === shipment.id);
    const start = nextNumber(declarationLines, "cd_line");

    for (const [index, line] of selectedShipmentLines.entries()) {
        const item = items.find((row) => row.id === line.item_id) || {};
        const profile = profiles.find((row) => row.item_id === line.item_id) || {};
        await repo.insert(collections.customsDeclarationLines, {
            id: formatId("cd_line", start + index),
            customs_declaration_id: declaration.id,
            item_id: line.item_id,
            hs_code: profile.hs_code || null,
            item_description: item.item_name || null,
            quantity: line.qty_shipped,
            unit: line.unit,
            customs_value: Number(body.default_customs_value || 0),
            import_duty_rate: Number(profile.import_duty_rate || 0),
            vat_rate: Number(profile.vat_rate || 0),
            co_form: profile.co_form || null,
            preferential_tax_rate: Number(profile.preferential_tax_rate || 0)
        });
    }

    return getCustomsDeclaration(declaration.id);
}

export async function clearCustomsDeclaration(id, body = {}) {
    const declaration = await requireRecord(collections.customsDeclarations, id, "Customs declaration not found");
    await repo.update(collections.customsDeclarations, id, {
        status: "CLEARED",
        cleared_at: body.cleared_at || new Date().toISOString(),
        ...(body.note ? { note: body.note } : {})
    });
    await repo.update(collections.shipments, declaration.shipment_id, {
        status: "CUSTOMS_CLEARED"
    });
    const milestones = await active(collections.shipmentMilestones);
    const customsMilestone = milestones.find((row) => (
        row.shipment_id === declaration.shipment_id &&
        row.milestone_code === "CUSTOMS_CLEARED"
    ));

    if (customsMilestone) {
        await repo.update(collections.shipmentMilestones, customsMilestone.id, {
            status: "DONE",
            actual_at: new Date().toISOString()
        });
    }

    return getCustomsDeclaration(id);
}

export async function getCustomsDeclaration(id) {
    const declaration = await requireRecord(collections.customsDeclarations, id, "Customs declaration not found");
    const lines = await active(collections.customsDeclarationLines);
    return {
        ...declaration,
        lines: lines.filter((line) => line.customs_declaration_id === id)
    };
}

export async function listCustomsDeclarationsByShipment(shipmentId) {
    await requireRecord(collections.shipments, shipmentId, "Shipment not found");
    return (await active(collections.customsDeclarations)).filter((declaration) => declaration.shipment_id === shipmentId);
}

export async function updateCustomsDeclaration(id, body) {
    await requireRecord(collections.customsDeclarations, id, "Customs declaration not found");
    const allowedFields = ["declaration_no", "customs_type", "customs_channel", "draft_opened_at", "official_opened_at", "cleared_at", "status", "note"];
    await repo.update(collections.customsDeclarations, id, pick(body, allowedFields));
    return getCustomsDeclaration(id);
}

export async function listCustomsDeclarationLines(id) {
    await requireRecord(collections.customsDeclarations, id, "Customs declaration not found");
    return (await active(collections.customsDeclarationLines)).filter((line) => line.customs_declaration_id === id);
}

export async function createCustomsDeclarationLine(id, body) {
    await requireRecord(collections.customsDeclarations, id, "Customs declaration not found");
    requireField(body, "item_id");
    const [lines, items, profiles] = await Promise.all([
        active(collections.customsDeclarationLines),
        active(collections.items),
        active(collections.itemCustomsProfiles)
    ]);
    const item = items.find((row) => row.id === body.item_id) || {};
    const profile = profiles.find((row) => row.item_id === body.item_id) || {};
    return repo.insert(collections.customsDeclarationLines, {
        id: nextId(lines, "cd_line"),
        customs_declaration_id: id,
        item_id: body.item_id,
        hs_code: body.hs_code || profile.hs_code || null,
        item_description: body.item_description || item.item_name || null,
        quantity: Number(body.quantity || 0),
        unit: body.unit || item.base_uom || item.unit || "PCS",
        customs_value: Number(body.customs_value || 0),
        import_duty_rate: Number(body.import_duty_rate ?? profile.import_duty_rate ?? 0),
        vat_rate: Number(body.vat_rate ?? profile.vat_rate ?? 0),
        co_form: body.co_form || profile.co_form || null,
        preferential_tax_rate: Number(body.preferential_tax_rate ?? profile.preferential_tax_rate ?? 0)
    });
}

export async function updateCustomsDeclarationLine(lineId, body) {
    await requireRecord(collections.customsDeclarationLines, lineId, "Customs declaration line not found");
    const allowedFields = ["item_id", "hs_code", "item_description", "quantity", "unit", "customs_value", "import_duty_rate", "vat_rate", "co_form", "preferential_tax_rate"];
    return repo.update(collections.customsDeclarationLines, lineId, pick(body, allowedFields));
}

export async function deleteCustomsDeclarationLine(lineId) {
    const deleted = await repo.softDelete(collections.customsDeclarationLines, lineId);
    if (!deleted) {
        throw apiError("NOT_FOUND", "Customs declaration line not found", { id: lineId }, 404);
    }
    return deleted;
}

export async function openCustomsDraft(id, body = {}) {
    await requireRecord(collections.customsDeclarations, id, "Customs declaration not found");
    await repo.update(collections.customsDeclarations, id, {
        status: "DRAFT_OPENED",
        draft_opened_at: body.opened_at || new Date().toISOString()
    });
    return getCustomsDeclaration(id);
}

export async function openCustomsOfficial(id, body = {}) {
    await requireRecord(collections.customsDeclarations, id, "Customs declaration not found");
    await repo.update(collections.customsDeclarations, id, {
        status: "OFFICIAL_OPENED",
        official_opened_at: body.opened_at || new Date().toISOString(),
        ...(body.customs_channel ? { customs_channel: body.customs_channel } : {}),
        ...(body.declaration_no ? { declaration_no: body.declaration_no } : {})
    });
    return getCustomsDeclaration(id);
}

export async function cancelCustomsDeclaration(id, body = {}) {
    await requireRecord(collections.customsDeclarations, id, "Customs declaration not found");
    await repo.update(collections.customsDeclarations, id, {
        status: "CANCELLED",
        cancel_reason: body.cancel_reason ?? body.note ?? null,
        ...(body.note ? { note: body.note } : {})
    });
    return getCustomsDeclaration(id);
}

export async function createCarrierDeliveryOrder(shipmentId, body) {
    const shipment = await requireRecord(collections.shipments, shipmentId, "Shipment not found");
    ensureShipmentCleared(shipment);
    const deliveryOrders = await active(collections.carrierDeliveryOrders);

    return repo.insert(collections.carrierDeliveryOrders, {
        id: nextId(deliveryOrders, "cdo"),
        shipment_id: shipment.id,
        carrier_do_no: body.carrier_do_no || nextDocumentNo("CDO-KBI-2026", deliveryOrders, "carrier_do_no"),
        forwarder_id: body.forwarder_id || "sup_001",
        issued_date: body.issued_date || new Date().toISOString().slice(0, 10),
        expired_date: body.expired_date || null,
        release_location: body.release_location || "Hai Phong Port",
        container_no: body.container_no || shipment.container_no,
        local_charge_amount: body.local_charge_amount || 0,
        currency_code: body.currency_code || "VND",
        status: body.status || "PENDING",
        note: body.note || null
    });
}

export async function listCarrierDeliveryOrders() {
    return active(collections.carrierDeliveryOrders);
}

export async function listCarrierDeliveryOrdersByShipment(shipmentId) {
    await requireRecord(collections.shipments, shipmentId, "Shipment not found");
    const [deliveryOrders, forwarders] = await Promise.all([
        active(collections.carrierDeliveryOrders),
        active(collections.forwarders)
    ]);
    return deliveryOrders
        .filter((order) => order.shipment_id === shipmentId)
        .sort((left, right) => String(right.create_at || "").localeCompare(String(left.create_at || "")))
        .map((order) => ({
            ...order,
            forwarder: forwarders.find((row) => row.id === order.forwarder_id) || null
        }));
}

export async function getCarrierDeliveryOrder(id) {
    return requireRecord(collections.carrierDeliveryOrders, id, "Carrier delivery order not found");
}

export async function issueCarrierDeliveryOrder(id) {
    return updateCarrierDeliveryOrderStatus(id, "ISSUED");
}

export async function releaseCarrierDeliveryOrder(id) {
    return updateCarrierDeliveryOrderStatus(id, "RELEASED");
}

export async function cancelCarrierDeliveryOrder(id) {
    return updateCarrierDeliveryOrderStatus(id, "CANCELLED");
}

export async function createDomesticTransportOrder(shipmentId, body) {
    const shipment = await requireRecord(collections.shipments, shipmentId, "Shipment not found");
    ensureShipmentCleared(shipment);
    const allContainers = await active(collections.shipmentContainers);
    const shipmentContainers = allContainers.filter((container) => container.shipment_id === shipment.id);
    const requestedContainerIds = Array.isArray(body.container_ids) ? body.container_ids : [];
    const selectedContainers = requestedContainerIds.length
        ? shipmentContainers.filter((container) => requestedContainerIds.includes(container.id))
        : [];
    if (requestedContainerIds.length && selectedContainers.length !== requestedContainerIds.length) {
        throw apiError("VALIDATION_ERROR", "One or more containers do not belong to this shipment", {
            shipment_id: shipment.id,
            container_ids: requestedContainerIds
        }, 400);
    }
    const containerNos = selectedContainers.length
        ? selectedContainers.map((container) => container.container_no)
        : (body.container_no || null);
    const dtos = await active(collections.domesticTransportOrders);
    const dto = await repo.insert(collections.domesticTransportOrders, {
        id: nextId(dtos, "dto"),
        dto_no: body.dto_no || nextDocumentNo("DTO-KBI-2026", dtos, "dto_no"),
        shipment_id: shipment.id,
        carrier_delivery_order_id: body.carrier_delivery_order_id || null,
        truck_vendor_id: body.truck_vendor_id || null,
        origin: body.origin || "Hai Phong Port",
        destination: body.destination || "Kim Binh Factory",
        warehouse: body.warehouse || "KBI Main Warehouse",
        vehicle_type: body.vehicle_type || null,
        vehicle_plate: body.vehicle_plate || null,
        driver_name: body.driver_name || null,
        driver_phone: body.driver_phone || null,
        container_no: containerNos,
        scheduled_pickup_at: body.scheduled_pickup_at || null,
        actual_pickup_at: null,
        scheduled_delivery_at: body.scheduled_delivery_at || null,
        actual_delivery_at: null,
        pod_document_ref: null,
        status: "DRAFT",
        note: body.note || null
    });
    for (const container of selectedContainers) {
        await repo.update(collections.shipmentContainers, container.id, { dto_id: dto.id });
    }
    const [shipmentLines, dtoLines] = await Promise.all([
        active(collections.shipmentLines),
        active(collections.domesticTransportOrderLines)
    ]);
    const selectedShipmentLines = shipmentLines.filter((line) => line.shipment_id === shipment.id);
    const dtoLineStart = nextNumber(dtoLines, "dto_line");
    for (const [index, line] of selectedShipmentLines.entries()) {
        await repo.insert(collections.domesticTransportOrderLines, {
            id: formatId("dto_line", dtoLineStart + index),
            domestic_transport_order_id: dto.id,
            purchase_order_line_id: line.purchase_order_line_id,
            po_lot_id: line.po_lot_id,
            item_id: line.item_id,
            qty: line.qty_shipped,
            unit: line.unit,
            sort_order: index + 1
        });
    }
    // Insert junction record for n:n relationship
    const allLinks = await active(collections.shipmentDtoLinks);
    await repo.insert(collections.shipmentDtoLinks, {
        id: nextId(allLinks, "sdl"),
        shipment_id: shipment.id,
        dto_id: dto.id
    });
    return getDomesticTransportOrder(dto.id);
}

export async function consolidateDomesticTransportOrder(body) {
    const shipmentIds = Array.isArray(body.shipment_ids) ? body.shipment_ids.filter(Boolean) : [];
    if (shipmentIds.length < 2) {
        throw apiError("VALIDATION_ERROR", "Consolidation requires at least two shipments", { shipment_ids: shipmentIds }, 400);
    }
    const primaryId = body.primary_shipment_id && shipmentIds.includes(body.primary_shipment_id)
        ? body.primary_shipment_id
        : shipmentIds[0];
    const otherIds = shipmentIds.filter((id) => id !== primaryId);

    // Validate every shipment: exists, customs-cleared, and shares the same discharge port (POD).
    const shipments = [];
    for (const id of shipmentIds) {
        const shipment = await requireRecord(collections.shipments, id, "Shipment not found");
        ensureShipmentCleared(shipment);
        shipments.push(shipment);
    }
    const pods = new Set(shipments.map((shipment) => shipment.pod || ""));
    if (pods.size > 1) {
        throw apiError("BUSINESS_RULE_VIOLATION", "All shipments must share the same discharge port (POD) to consolidate into one DTO", { pods: [...pods] }, 409);
    }

    // Group requested containers by their owning shipment (must belong to a selected shipment).
    const requestedContainerIds = Array.isArray(body.container_ids) ? body.container_ids : [];
    const allContainers = await active(collections.shipmentContainers);
    const containerById = new Map(allContainers.map((container) => [container.id, container]));
    const containersByShipment = new Map(shipmentIds.map((id) => [id, []]));
    for (const containerId of requestedContainerIds) {
        const container = containerById.get(containerId);
        if (!container || !containersByShipment.has(container.shipment_id)) {
            throw apiError("VALIDATION_ERROR", "Container does not belong to any selected shipment", { container_id: containerId }, 400);
        }
        containersByShipment.get(container.shipment_id).push(containerId);
    }

    // Create the DTO on the primary shipment (handles primary link, DTO lines, and primary containers).
    const dto = await createDomesticTransportOrder(primaryId, {
        container_ids: containersByShipment.get(primaryId),
        truck_vendor_id: body.truck_vendor_id,
        warehouse: body.warehouse,
        scheduled_pickup_at: body.scheduled_pickup_at,
        note: body.note
    });

    // Link the remaining shipments to the same DTO and reassign their selected containers.
    for (const otherId of otherIds) {
        const links = await active(collections.shipmentDtoLinks);
        const alreadyLinked = links.some((link) => link.shipment_id === otherId && link.dto_id === dto.id);
        if (!alreadyLinked) {
            await repo.insert(collections.shipmentDtoLinks, {
                id: nextId(links, "sdl"),
                shipment_id: otherId,
                dto_id: dto.id
            });
        }
        for (const containerId of containersByShipment.get(otherId) || []) {
            await repo.update(collections.shipmentContainers, containerId, { dto_id: dto.id });
        }
    }

    return getDomesticTransportOrder(dto.id);
}

export async function getDomesticTransportOrder(id) {
    const dto = await requireRecord(collections.domesticTransportOrders, id, "Domestic transport order not found");
    const context = await getDomesticTransportOrderContext();
    return enrichDomesticTransportOrder(dto, context);
}

export async function listDomesticTransportOrders(query = {}) {
    const context = await getDomesticTransportOrderContext();
    const search = searchTerm(query);

    const items = context.domesticTransportOrders
        .filter((order) => {
            if (query.status && order.status !== query.status) return false;
            if (query.shipment_id) {
                const isLinked = context.shipmentDtoLinks.some(
                    (link) => link.dto_id === order.id && link.shipment_id === query.shipment_id
                );
                if (order.shipment_id !== query.shipment_id && !isLinked) return false;
            }
            if (query.truck_vendor_id && order.truck_vendor_id !== query.truck_vendor_id) return false;
            if (!search) return true;

            const shipment = context.shipments.find((row) => row.id === order.shipment_id) || {};
            const vendor = context.forwarders.find((row) => row.id === order.truck_vendor_id) || {};
            return [
                order.dto_no,
                order.origin,
                order.destination,
                order.warehouse,
                order.vehicle_plate,
                order.driver_name,
                shipment.shipment_no,
                vendor.forwarder_name,
                vendor.forwarder_code
            ].some((value) => String(value || "").toLowerCase().includes(search));
        })
        .sort((left, right) => String(right.create_at || "").localeCompare(String(left.create_at || "")))
        .map((order) => enrichDomesticTransportOrder(order, context));

    return paginateResult(items, query);
}

export async function updateDomesticTransportOrder(id, body) {
    const dto = await requireRecord(collections.domesticTransportOrders, id, "Domestic transport order not found");

    if (body.status === "DISPATCHED" && dto.status !== "QUOTE_CONFIRMED") {
        throw apiError("BUSINESS_RULE_VIOLATION", "Cannot dispatch DTO before QUOTE_CONFIRMED", {}, 409);
    }

    if (body.status && !dtoStatusFlow.includes(body.status)) {
        throw apiError("VALIDATION_ERROR", "Invalid DTO status", { status: body.status }, 400);
    }

    const allowedFields = [
        "carrier_delivery_order_id",
        "truck_vendor_id",
        "origin",
        "destination",
        "warehouse",
        "vehicle_type",
        "vehicle_plate",
        "driver_name",
        "driver_phone",
        "scheduled_pickup_at",
        "actual_pickup_at",
        "scheduled_delivery_at",
        "actual_delivery_at",
        "pod_document_ref",
        "quote_amount",
        "quote_currency",
        "status",
        "note"
    ];
    await repo.update(collections.domesticTransportOrders, id, pick(body, allowedFields));
    return getDomesticTransportOrder(id);
}

export async function markDomesticTransportOrderQuotePending(id) {
    return updateDomesticTransportOrderStatus(id, "QUOTE_PENDING");
}

export async function confirmDomesticTransportOrderQuote(id) {
    return updateDomesticTransportOrderStatus(id, "QUOTE_CONFIRMED");
}

export async function dispatchDomesticTransportOrder(id) {
    const dto = await requireRecord(collections.domesticTransportOrders, id, "Domestic transport order not found");
    if (dto.status !== "QUOTE_CONFIRMED") {
        throw apiError("BUSINESS_RULE_VIOLATION", "Cannot dispatch DTO before QUOTE_CONFIRMED", {}, 409);
    }
    return updateDomesticTransportOrderStatus(id, "DISPATCHED");
}

export async function startDomesticTransportOrderTransit(id) {
    return updateDomesticTransportOrderStatus(id, "IN_TRANSIT");
}

export async function deliverDomesticTransportOrder(id) {
    return updateDomesticTransportOrderStatus(id, "DELIVERED", {
        actual_delivery_at: new Date().toISOString()
    });
}

export async function markDomesticTransportOrderPodReceived(id) {
    const dto = await requireRecord(collections.domesticTransportOrders, id, "Domestic transport order not found");
    if (!["DELIVERED", "POD_RECEIVED"].includes(dto.status)) {
        throw apiError("BUSINESS_RULE_VIOLATION", "POD can be recorded only after the DTO is DELIVERED", { status: dto.status }, 409);
    }
    return updateDomesticTransportOrderStatus(id, "POD_RECEIVED");
}

export async function closeDomesticTransportOrder(id) {
    return updateDomesticTransportOrderStatus(id, "CLOSED");
}

export async function cancelDomesticTransportOrder(id) {
    return updateDomesticTransportOrderStatus(id, "CANCELLED");
}

export async function listShipmentDomesticTransportOrders(shipmentId, query = {}) {
    // Validate shipment exists
    await requireRecord(collections.shipments, shipmentId, "Shipment not found");
    // Find all DTO IDs linked to this shipment via junction table
    const allLinks = await active(collections.shipmentDtoLinks);
    const dtoIds = new Set(
        allLinks
            .filter((link) => link.shipment_id === shipmentId)
            .map((link) => link.dto_id)
    );
    // Also include DTOs whose primary shipment_id matches (backward compat)
    const allDtos = await active(collections.domesticTransportOrders);
    allDtos.filter((dto) => dto.shipment_id === shipmentId).forEach((dto) => dtoIds.add(dto.id));

    const context = await getDomesticTransportOrderContext();
    const items = [...dtoIds]
        .map((id) => context.domesticTransportOrders.find((dto) => dto.id === id))
        .filter(Boolean)
        .map((dto) => enrichDomesticTransportOrder(dto, context));
    return paginateResult(items, query);
}

export async function linkDtoToShipment(shipmentId, body) {
    const { dto_id } = body;
    if (!dto_id) throw apiError("VALIDATION_ERROR", "dto_id is required", {}, 400);
    await requireRecord(collections.shipments, shipmentId, "Shipment not found");
    await requireRecord(collections.domesticTransportOrders, dto_id, "Domestic transport order not found");

    // Check not already linked
    const allLinks = await active(collections.shipmentDtoLinks);
    const exists = allLinks.some((link) => link.shipment_id === shipmentId && link.dto_id === dto_id);
    if (exists) throw apiError("STATE_CONFLICT", "DTO is already linked to this shipment", {}, 409);

    const newId = nextId(allLinks, "sdl");
    await repo.insert(collections.shipmentDtoLinks, {
        id: newId,
        shipment_id: shipmentId,
        dto_id
    });
    return getDomesticTransportOrder(dto_id);
}

export async function unlinkDtoFromShipment(shipmentId, dtoId) {
    await requireRecord(collections.shipments, shipmentId, "Shipment not found");
    await requireRecord(collections.domesticTransportOrders, dtoId, "Domestic transport order not found");

    const allLinks = await active(collections.shipmentDtoLinks);
    const link = allLinks.find((l) => l.shipment_id === shipmentId && l.dto_id === dtoId);
    if (!link) throw apiError("NOT_FOUND", "DTO is not linked to this shipment", {}, 404);

    await repo.softDelete(collections.shipmentDtoLinks, link.id);
    return getDomesticTransportOrder(dtoId);
}

async function updatePurchaseOrderStatus(id, status) {
    await requireRecord(collections.purchaseOrders, id, "Purchase order not found");
    await repo.update(collections.purchaseOrders, id, { status });
    return getPurchaseOrder(id);
}

async function updateDeliveryOrderStatus(id, status) {
    await requireRecord(collections.deliveryOrders, id, "Delivery order not found");
    await repo.update(collections.deliveryOrders, id, { status });
    return getDeliveryOrder(id);
}

async function updateQuotationStatus(id, status, extraPatch = {}) {
    const quotation = await requireRecord(collections.quotations, id, "Quotation not found");
    const now = new Date().toISOString();
    await repo.update(collections.quotations, id, {
        status,
        confirmed_at: status === "CONFIRMED" ? now : quotation.confirmed_at || null,
        rejected_at: status === "REJECTED" ? now : quotation.rejected_at || null,
        ...extraPatch
    });
    await syncRfqStatusFromQuotation({ ...quotation, status });
    return getQuotation(id);
}

async function updateShipmentStatus(id, status) {
    await requireRecord(collections.shipments, id, "Shipment not found");
    await repo.update(collections.shipments, id, { status });
    return getShipment(id);
}

async function updateCarrierDeliveryOrderStatus(id, status) {
    await requireRecord(collections.carrierDeliveryOrders, id, "Carrier delivery order not found");
    return repo.update(collections.carrierDeliveryOrders, id, { status });
}

async function updateDomesticTransportOrderStatus(id, status, extraPatch = {}) {
    if (status !== "CANCELLED" && !dtoStatusFlow.includes(status)) {
        throw apiError("VALIDATION_ERROR", "Invalid DTO status", { status }, 400);
    }

    await requireRecord(collections.domesticTransportOrders, id, "Domestic transport order not found");
    await repo.update(collections.domesticTransportOrders, id, {
        ...extraPatch,
        status
    });
    return getDomesticTransportOrder(id);
}

async function readScreenOrNull(collectionName) {
    try {
        return await repo.readCollection(collectionName);
    } catch (err) {
        if (err.code === "ENOENT") {
            return null;
        }
        throw err;
    }
}

async function findTaskItem(id) {
    const tasks = await active(collections.logisticsTasks);
    const task = tasks.find((item) => item.id === id || item.task_id === id);
    return task ? projectLogisticsTaskToScreenItem(task) : null;
}

function filterTasks(items, query) {
    const filters = pick(query, ["status", "priority", "stage", "department", "ref_type", "ref_id", "assignee_id", "assignee_code"]);

    return items.filter((task) => Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return true;
        }

        if (key === "assignee_id") {
            return String(task.assignee?.id || task.assignee?.user_id || "") === String(value);
        }

        return String(task[key] || "") === String(value);
    }));
}

function buildTaskSummary(items) {
    return {
        total: items.length,
        pending: items.filter((task) => task.status === "PENDING").length,
        in_progress: items.filter((task) => task.status === "IN_PROGRESS").length,
        blocked: items.filter((task) => task.status === "BLOCKED").length,
        completed: items.filter((task) => task.status === "COMPLETED").length,
        overdue: items.filter((task) => task.status !== "COMPLETED" && task.due_at && new Date(task.due_at) < new Date()).length
    };
}

function buildTaskPatch(body = {}) {
    const patch = {};

    if (body.status !== undefined) {
        if (!taskStatuses.includes(body.status)) {
            throw apiError("VALIDATION_ERROR", "Invalid task status", { status: body.status }, 400);
        }
        patch.status = body.status;
    }

    if (body.progress !== undefined) {
        const progress = Number(body.progress);
        if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
            throw apiError("VALIDATION_ERROR", "progress must be between 0 and 100", { progress: body.progress }, 400);
        }
        patch.progress = progress;
    }

    for (const field of [
        "note",
        "blocked_reason",
        "priority",
        "due_at",
        "completed_at",
        "task_name",
        "department",
        "assignee_code",
        "do_number",
        "po_number",
        "request_code",
        "hbl_number",
        "production_contract_number",
        "is_required_for_do_closure",
        "blocked_by_party"
    ]) {
        if (body[field] !== undefined) {
            patch[field] = body[field];
        }
    }

    if (body.assignee !== undefined) {
        patch.assignee = {
            id: body.assignee?.id ?? null,
            name: body.assignee?.name || "Unassigned",
            department: body.department ?? body.assignee?.department ?? null
        };
    }

    if (body.due_at !== undefined || body.due_date !== undefined) {
        patch.due_date = body.due_date ?? body.due_at;
    }

    if (body.notes !== undefined && body.note === undefined) {
        patch.note = body.notes;
    }

    if (patch.status === "COMPLETED" && patch.completed_at === undefined) {
        patch.completed_at = new Date().toISOString();
        patch.progress = patch.progress ?? 100;
    }

    return patch;
}

function normalizeAssignee(body = {}) {
    const source = body.assignee || body;
    const id = source.id || source.user_id || null;
    const assigneeCode = body.assignee_code ?? source.assignee_code ?? source.code ?? null;

    if (!id && !assigneeCode) {
        throw apiError("VALIDATION_ERROR", "assignee_code or assignee.id is required", { field: "assignee_code" }, 400);
    }

    return {
        id,
        name: source.name || "Unassigned",
        department: body.department || source.department || null,
        assignee_code: assigneeCode
    };
}

async function persistTaskPatch(id, patch) {
    const current = await repo.findById(collections.logisticsTasks, id);

    if (!current) {
        throw apiError("NOT_FOUND", "Task not found", { id }, 404);
    }

    const assigneePatch = patch.assignee
        ? { assignee: { ...patch.assignee, department: patch.department ?? patch.assignee.department ?? current.department ?? null } }
        : {};
    if (patch.assignee?.assignee_code !== undefined) {
        patch.assignee_code = patch.assignee.assignee_code;
        delete patch.assignee.assignee_code;
    }
    await repo.update(collections.logisticsTasks, id, {
        ...patch,
        ...assigneePatch,
        update_at: new Date().toISOString()
    });

    return getTask(id);
}

function buildPurchaseOrderTaskScreen(purchaseOrder, items) {
    const poTasks = items.filter((task) => task.po_number === purchaseOrder.po_no);
    const groupCodes = [...new Set(poTasks.map((task) => task.template_group_code || task.milestone_code || "UNGROUPED"))];

    return {
        purchase_order: {
            id: purchaseOrder.id,
            po_no: purchaseOrder.po_no,
            status: purchaseOrder.status
        },
        task_groups: groupCodes.map((stage) => ({
            stage,
            tasks: poTasks
                .filter((task) => task.stage === stage)
                .sort((left, right) => String(left.due_at || "").localeCompare(String(right.due_at || "")))
        }))
    };
}

function projectLogisticsTaskToScreenItem(task) {
    const dueAt = task.due_date || task.due_at || null;
    const department = task.department || task.template?.department || task.assignee?.department || null;
    const groupCode = task.group_code || task.template_group_code || task.template?.group_code || null;
    const groupName = task.group_name || task.template_group_name || task.template?.group_name || null;
    const milestoneCode = task.milestone_code || task.template?.milestone_code || null;
    const doNumber = task.do_number || null;
    const poNumber = task.po_number || null;

    return {
        id: task.id || task.task_id,
        task_no: task.task_no || String(task.id || task.task_id || "").toUpperCase().replace("_", "-"),
        task_name: task.task_name,
        ref_type: doNumber ? "DELIVERY_ORDER" : "PURCHASE_ORDER",
        ref_id: doNumber || poNumber || "",
        ref_no: doNumber || poNumber || "",
        po_number: poNumber,
        stage: groupCode || milestoneCode || "UNGROUPED",
        assignee: {
            id: task.assignee?.id ?? task.assignee?.user_id ?? null,
            name: task.assignee?.name || "Unassigned",
            department
        },
        assignee_code: task.assignee_code ?? null,
        status: task.status,
        priority: task.priority,
        due_at: dueAt,
        completed_at: task.completed_at || null,
        progress: Number(task.progress || 0),
        blocked_reason: task.blocked_reason || null,
        note: task.notes ?? task.note ?? null,
        task_template_id: task.task_template_id ?? null,
        milestone_code: milestoneCode,
        department,
        sla_hours: task.sla_hours ?? task.template?.sla_hours ?? null,
        sla_text: task.sla_text ?? task.template?.sla_text ?? null,
        related_documents: task.related_documents ?? task.template?.related_documents ?? null,
        is_required_for_closure: Boolean(task.is_required_for_do_closure),
        blocked_by_party: task.blocked_by_party ?? null,
        template_group_code: groupCode,
        template_group_name: groupName,
        create_at: task.created_at || task.create_at || null,
        update_at: task.update_at || null
    };
}

async function active(collectionName) {
    return (await repo.readCollection(collectionName)).filter((row) => row.is_delete !== true);
}

function searchTerm(query = {}) {
    return String(query.search || query.q || "").trim().toLowerCase();
}

// Pick the representative customs declaration for a shipment: skip cancelled
// ones and prefer the most recently created/cleared. The channel (luong) is
// assigned when a declaration is opened and persists after clearance, so it is
// surfaced whenever any active declaration exists.
function pickShipmentCustomsChannel(declarations, shipmentId) {
    const candidates = declarations
        .filter((row) => row.shipment_id === shipmentId && row.status !== "CANCELLED")
        .sort((left, right) => String(right.cleared_at || right.create_at || "")
            .localeCompare(String(left.cleared_at || left.create_at || "")));
    return candidates[0]?.customs_channel ?? null;
}

function positiveInteger(value, fallback) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function paginateResult(items, query = {}) {
    const total = items.length;
    const defaultLimit = total > 0 ? total : 20;
    const limit = positiveInteger(query.limit, defaultLimit);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(positiveInteger(query.page, 1), totalPages);
    const startIndex = (page - 1) * limit;

    return {
        data: items.slice(startIndex, startIndex + limit),
        meta: {
            total,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        }
    };
}

async function requireRecord(collectionName, id, message) {
    const record = await repo.findById(collectionName, id);

    if (!record) {
        throw apiError("NOT_FOUND", message, { id }, 404);
    }

    return record;
}

async function getPurchaseOrderLinesForAll() {
    const [lines, items, profiles] = await Promise.all([
        active(collections.purchaseOrderLines),
        active(collections.items),
        active(collections.itemCustomsProfiles)
    ]);

    return lines.map((line) => ({
        ...line,
        item: items.find((item) => item.id === line.item_id) || null,
        item_customs_profile: profiles.find((profile) => profile.id === line.item_customs_profile_id) || null
    }));
}

async function getPurchaseOrderLines(purchaseOrderId) {
    const [lines, items, profiles] = await Promise.all([
        active(collections.purchaseOrderLines),
        active(collections.items),
        active(collections.itemCustomsProfiles)
    ]);
    return lines
        .filter((line) => line.purchase_order_id === purchaseOrderId)
        .sort(bySortOrder)
        .map((line) => ({
            ...line,
            item: items.find((item) => item.id === line.item_id) || null,
            item_customs_profile: profiles.find((profile) => profile.id === line.item_customs_profile_id) || null
        }));
}

function enrichLotLine(line, poLines, items) {
    const poLine = poLines.find((row) => row.id === line.purchase_order_line_id);
    const item = items.find((row) => row.id === line.item_id) || poLine?.item || null;
    const customsProfile = poLine?.item_customs_profile || null;

    return {
        ...line,
        notes: line.notes || null,
        item_code: item?.item_code || null,
        item_name: item?.item_name || poLine?.item_description || null,
        hs_code: customsProfile?.hs_code || null,
        gross_weight_kg: poLine?.gross_weight_kg || null,
        qty_ordered: poLine?.qty_ordered || null,
        item,
        item_customs_profile: customsProfile,
        purchase_order_line: poLine || null
    };
}

function enrichDeliveryOrderLine(line, context) {
    const enrichedLine = enrichLotLine(line, context.lines, context.items);
    const deliveryOrder = context.deliveryOrders.find((row) => row.id === line.delivery_order_id) || null;
    const lot = context.lots.find((row) => row.id === line.po_lot_id) || null;
    const shipmentLine = context.shipmentLines.find((row) => row.delivery_order_line_id === line.id) || null;
    const shipment = shipmentLine
        ? context.shipments.find((row) => row.id === shipmentLine.shipment_id) || null
        : context.shipments.find((row) => row.delivery_order_id === line.delivery_order_id) || null;

    return {
        ...enrichedLine,
        delivery_order: deliveryOrder,
        lot,
        lot_no: lot?.lot_no || null,
        shipment,
        shipment_line: shipmentLine,
        shipment_number: shipment?.shipment_no || null,
        container_no: shipment?.container_no || null,
        route_origin: shipment?.pol || deliveryOrder?.origin_address || null,
        route_destination: shipment?.pod || deliveryOrder?.destination_address || null,
        etd: shipment?.etd || deliveryOrder?.planned_etd || null,
        eta: shipment?.eta || deliveryOrder?.planned_eta || null
    };
}

async function getDomesticTransportOrderContext() {
    const [
        domesticTransportOrders,
        domesticTransportOrderLines,
        shipments,
        shipmentLines,
        carrierDeliveryOrders,
        suppliers,
        forwarders,
        purchaseOrderLines,
        lots,
        items,
        itemCustomsProfiles,
        shipmentDtoLinks
    ] = await Promise.all([
        active(collections.domesticTransportOrders),
        active(collections.domesticTransportOrderLines),
        active(collections.shipments),
        active(collections.shipmentLines),
        active(collections.carrierDeliveryOrders),
        active(collections.suppliers),
        active(collections.forwarders),
        active(collections.purchaseOrderLines),
        active(collections.lots),
        active(collections.items),
        active(collections.itemCustomsProfiles),
        active(collections.shipmentDtoLinks)
    ]);

    return {
        domesticTransportOrders,
        domesticTransportOrderLines,
        shipments,
        shipmentLines,
        carrierDeliveryOrders,
        suppliers,
        forwarders,
        purchaseOrderLines,
        lots,
        items,
        itemCustomsProfiles,
        shipmentDtoLinks
    };
}

function enrichDomesticTransportOrder(order, context) {
    const shipment = context.shipments.find((row) => row.id === order.shipment_id) || null;
    const carrierDeliveryOrder = context.carrierDeliveryOrders.find((row) => row.id === order.carrier_delivery_order_id) || null;
    const truckVendor = context.forwarders.find((row) => row.id === order.truck_vendor_id) || null;
    const lines = context.domesticTransportOrderLines
        .filter((line) => line.domestic_transport_order_id === order.id)
        .sort(bySortOrder)
        .map((line) => enrichDomesticTransportOrderLine(line, context));

    // Find all shipment_ids linked to this DTO via junction table
    const linkedShipmentIds = (context.shipmentDtoLinks || [])
        .filter((link) => link.dto_id === order.id)
        .map((link) => link.shipment_id);
    // Union with primary shipment_id for backward compat
    const allShipmentIds = [...new Set([order.shipment_id, ...linkedShipmentIds].filter(Boolean))];
    const shipments = allShipmentIds.map((id) => context.shipments.find((s) => s.id === id) || null).filter(Boolean);

    return {
        ...order,
        shipment,
        shipments,
        carrier_delivery_order: carrierDeliveryOrder,
        truck_vendor: truckVendor,
        lines,
        total_qty: roundNumber(lines.reduce((total, line) => total + Number(line.qty || 0), 0)),
        total_gross_weight_kg: roundNumber(lines.reduce((total, line) => total + Number(line.gross_weight_kg || 0), 0))
    };
}

function enrichDomesticTransportOrderLine(line, context) {
    const purchaseOrderLine = context.purchaseOrderLines.find((row) => row.id === line.purchase_order_line_id) || null;
    const item = context.items.find((row) => row.id === line.item_id) || null;
    const lot = context.lots.find((row) => row.id === line.po_lot_id) || null;
    const profile = context.itemCustomsProfiles.find((row) => (
        row.id === purchaseOrderLine?.item_customs_profile_id ||
        row.item_id === line.item_id
    )) || null;
    const transportOrder = context.domesticTransportOrders.find((row) => row.id === line.domestic_transport_order_id) || null;
    const shipmentLine = context.shipmentLines.find((row) => (
        row.shipment_id === transportOrder?.shipment_id &&
        row.purchase_order_line_id === line.purchase_order_line_id &&
        row.item_id === line.item_id
    )) || null;

    return {
        ...line,
        item,
        item_code: item?.item_code || null,
        item_name: item?.item_name || purchaseOrderLine?.item_description || null,
        item_description: purchaseOrderLine?.item_description || item?.item_name || null,
        hs_code: profile?.hs_code || null,
        gross_weight_kg: purchaseOrderLine?.gross_weight_kg || null,
        qty_ordered: purchaseOrderLine?.qty_ordered || null,
        purchase_order_line: purchaseOrderLine,
        item_customs_profile: profile,
        lot,
        lot_no: lot?.lot_no || null,
        shipment_line: shipmentLine
    };
}

function getPurchaseOrderDelayedDays(purchaseOrder, shipments, domesticTransportOrders) {
    const explicitDelay = [
        purchaseOrder.delayed_days,
        ...shipments.map((shipment) => shipment.delayed_days),
        ...domesticTransportOrders.map((order) => order.delayed_days)
    ].map(Number).filter((value) => Number.isFinite(value) && value > 0);

    if (explicitDelay.length) {
        return Math.max(...explicitDelay);
    }

    const actualDelays = [
        ...shipments.map((shipment) => daysLate(shipment.eta, shipment.ata)),
        ...domesticTransportOrders.map((order) => daysLate(order.scheduled_delivery_at, order.actual_delivery_at))
    ].filter((value) => value > 0);

    if (actualDelays.length) {
        return Math.max(...actualDelays);
    }

    const openDueDates = [
        ...shipments.filter((shipment) => !shipment.ata).map((shipment) => shipment.eta),
        ...domesticTransportOrders.filter((order) => !order.actual_delivery_at).map((order) => order.scheduled_delivery_at)
    ];
    const today = new Date();
    const openDelays = openDueDates.map((date) => daysLate(date, today)).filter((value) => value > 0);

    return openDelays.length ? Math.max(...openDelays) : 0;
}

function daysLate(planned, actual) {
    const plannedDate = toDate(planned);
    const actualDate = toDate(actual);

    if (!plannedDate || !actualDate) {
        return 0;
    }

    const diffMs = actualDate.getTime() - plannedDate.getTime();
    return diffMs > 0 ? Math.ceil(diffMs / 86400000) : 0;
}

function firstByDate(rows, field) {
    return [...rows]
        .filter((row) => row[field])
        .sort((left, right) => toDate(left[field]).getTime() - toDate(right[field]).getTime())[0];
}

function roundNumber(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

function toDate(value) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function uniqueValues(values) {
    return [...new Set(values)];
}

function requireField(body, field) {
    if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
        throw apiError("VALIDATION_ERROR", `${field} is required`, { field }, 400);
    }
}

function ensureLotUnlocked(lot) {
    if (lockedLotStatuses.includes(lot.status)) {
        throw apiError("STATE_CONFLICT", "LOT is locked", { lot_id: lot.id, status: lot.status }, 409);
    }
}

function ensureShipmentCleared(shipment) {
    if (shipment.status !== "CUSTOMS_CLEARED") {
        throw apiError("BUSINESS_RULE_VIOLATION", "Shipment must be CUSTOMS_CLEARED", { shipment_id: shipment.id }, 409);
    }
}

function pick(source, allowedFields) {
    return Object.fromEntries(Object.entries(source || {}).filter(([key]) => allowedFields.includes(key)));
}

function bySortOrder(left, right) {
    return (left.sort_order || 0) - (right.sort_order || 0);
}

function maxSort(rows) {
    return rows.reduce((max, row) => Math.max(max, Number(row.sort_order || 0)), 0);
}

function nextId(rows, prefix) {
    return formatId(prefix, nextNumber(rows, prefix));
}

function nextNumber(rows, prefix) {
    const max = rows.reduce((highest, row) => {
        const match = String(row.id).match(new RegExp(`^${prefix}_(\\d+)$`));
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return max + 1;
}

function maxNumber(rows, field) {
    return rows.reduce((max, row) => Math.max(max, Number(row[field] || 0)), 0);
}

function formatId(prefix, sequence) {
    return `${prefix}_${String(sequence).padStart(3, "0")}`;
}

// Collision-free business document number generator. Derives the next sequence
// from the highest number already used in `rows[field]` (e.g. "DO-KBI-2026-014"),
// NOT from `rows.length` — a length-based counter re-issues an existing number
// whenever a soft-deleted/cancelled row makes the active count fall below the max
// number already assigned, producing duplicate DO/PO/quotation numbers.
function nextDocumentNo(prefix, rows, field) {
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);
    const max = rows.reduce((highest, row) => {
        const match = String(row?.[field] ?? "").match(pattern);
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function nextRfqNo(rows) {
    const pattern = /^RFQ-2026-(\d+)$/;
    const max = rows.reduce((highest, row) => {
        const match = String(row?.rfq_no ?? "").match(pattern);
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `RFQ-2026-${String(max + 1).padStart(4, "0")}`;
}

function nextBusinessId(rows, prefix) {
    const pattern = new RegExp(`^${prefix}[-_](\\d+)$`);
    const max = rows.reduce((highest, row) => {
        const match = String(row?.id ?? "").match(pattern);
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

function normalizeCollectionName(collection) {
    const normalized = String(collection || "").trim();
    const collectionName = collectionAliases[normalized] || collectionAliases[normalized.replaceAll("-", "_")] || normalized.replaceAll("_", "-");

    if (!Object.values(collectionAliases).includes(collectionName) && !Object.values(collections).includes(collectionName)) {
        throw apiError("NOT_FOUND", "Mock collection not found", { collection }, 404);
    }

    return collectionName;
}

function toTableName(collectionName) {
    return Object.entries(collectionAliases).find(([, fileName]) => fileName === collectionName)?.[0] || collectionName.replaceAll("-", "_");
}

function idPrefixForCollection(collectionName) {
    const tableName = toTableName(collectionName);
    const special = {
        currencies: "cur",
        incoterms: "inc",
        transport_modes: "tm",
        suppliers: "sup",
        supplier_transport_modes: "stm",
        item_groups: "grp",
        item_master: "item",
        item_customs_profiles: "icp",
        purchase_orders: "po",
        purchase_order_lines: "po_line",
        purchase_order_confirmations: "poc",
        purchase_order_confirmation_lines: "pocl",
        po_lots: "lot",
        po_lot_lines: "lot_line",
        delivery_orders: "do",
        delivery_order_lots: "do_lot",
        delivery_order_lines: "do_line",
        quotation_requests: "qr",
        quotation_request_lines: "qrl",
        quotation_options: "qo",
        quotations: "qt",
        quotation_charge_lines: "qt_line",
        quotation_events: "qt_event",
        quotation_line_adjustments: "qt_adj",
        shipments: "shp",
        shipment_lines: "shp_line",
        shipment_milestones: "ms",
        shipment_documents: "shp_doc",
        shipment_costs: "shp_cost",
        delivery_order_documents: "do_doc",
        customs_declarations: "cd",
        customs_declaration_lines: "cd_line",
        carrier_delivery_orders: "cdo",
        domestic_transport_orders: "dto",
        domestic_transport_order_lines: "dto_line",
        shipment_dto_links: "sdl"
    };

    return special[tableName] || tableName.split("_").map((part) => part[0]).join("");
}
