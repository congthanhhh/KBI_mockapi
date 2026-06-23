process.env.DATA_SOURCE = "mock";
process.env.CORS_ORIGIN = "*";

const { seedMockData } = await import("./seed-mock-data.js");
await seedMockData();

const { default: app } = await import("../src/app.js");

const server = app.listen(0);
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/api/v1`;

try {
    await get("/mock/health");
    await getRoot("/currencies");
    await getRoot("/items");
    await getRoot("/options");
    await get("/currencies");
    await get("/items/item_001/customs-profiles");
    await get("/purchase-orders");
    await get("/purchase-orders/po_001/lines");
    await get("/purchase-orders/po_001/confirmations");
    await post("/purchase-orders", {
        po_no: "PO-KBI-2026-999",
        supplier_id: "sup_sdec",
        lines: [
            {
                item_id: "item_002",
                qty_ordered: 20,
                unit: "PCS",
                unit_price: 12
            }
        ]
    });
    await get("/purchase-orders/po_001/lot-planning");
    await post("/po-lot-lines/lot_line_001/split", {
        target_lot_id: "lot_002",
        split_qty: 10
    });
    await post("/po-lot-lines/lot_line_001/move", {
        target_lot_id: "lot_002",
        target_sort_order: 1
    });
    const deliveryOrder = await post("/delivery-orders/from-lots", {
        lot_ids: ["lot_002"]
    });
    await post(`/delivery-orders/${deliveryOrder.id}/ready-for-quotation`, {});
    const quotation = await post(`/delivery-orders/${deliveryOrder.id}/quotations`, {
        quotation_type: "FREIGHT"
    });
    await post(`/quotations/${quotation.id}/mark-final`, {});

    // DO screen-DTO is backend-owned and carries a real task summary.
    const screenList = await get("/delivery-orders/screen");
    assert(Array.isArray(screenList) && screenList.length > 0, "GET /delivery-orders/screen should return a non-empty array");
    assertScreenShape(screenList[0], "screen list item");
    const screenDetail = await get(`/delivery-orders/${deliveryOrder.id}/screen`);
    assertScreenShape(screenDetail, "screen detail");
    assert(
        screenDetail.order_info.order_number === (deliveryOrder.delivery_order_no || deliveryOrder.do_no),
        "screen detail order_number should match the created DO"
    );

    // Omit shipment_no to exercise backend auto-generation.
    const shipment = await post("/shipments/from-delivery-order", {
        delivery_order_id: deliveryOrder.id
    });
    assert(
        typeof shipment.shipment_no === "string" && shipment.shipment_no.length > 0,
        "shipment_no should be auto-generated when omitted"
    );
    await get(`/shipments/${shipment.id}/milestones`);
    await post(`/shipments/${shipment.id}/milestones/CUSTOMS_CLEARED/done`, {});

    const declaration = await post(`/shipments/${shipment.id}/customs-declarations`, {});
    await post(`/customs-declarations/${declaration.id}/open-draft`, {});
    await post(`/customs-declarations/${declaration.id}/open-official`, {});
    await post(`/customs-declarations/${declaration.id}/clear`, {});

    const carrierDeliveryOrder = await post(`/shipments/${shipment.id}/carrier-delivery-orders`, {});
    await get(`/shipments/${shipment.id}/carrier-delivery-orders`);
    await post(`/carrier-delivery-orders/${carrierDeliveryOrder.id}/issue`, {});
    await post(`/carrier-delivery-orders/${carrierDeliveryOrder.id}/release`, {});

    // DTO full status flow, including POD_RECEIVED -> CLOSED.
    const dto = await post(`/shipments/${shipment.id}/domestic-transport-orders`, {});
    await post(`/domestic-transport-orders/${dto.id}/quote-pending`, {});
    await post(`/domestic-transport-orders/${dto.id}/confirm-quote`, {});
    await post(`/domestic-transport-orders/${dto.id}/dispatch`, {});
    await post(`/domestic-transport-orders/${dto.id}/start-transit`, {});
    await post(`/domestic-transport-orders/${dto.id}/deliver`, {});
    const podDto = await post(`/domestic-transport-orders/${dto.id}/pod-received`, {});
    assert(podDto.status === "POD_RECEIVED", "DTO should reach POD_RECEIVED");
    const closedDto = await post(`/domestic-transport-orders/${dto.id}/close`, {});
    assert(closedDto.status === "CLOSED", "DTO should close");

    // Atomic consolidation: one DTO serving two customs-cleared shipments at the same POD.
    const consolidated = await post("/domestic-transport-orders/consolidate", {
        shipment_ids: ["shp_005", "shp_010"],
        primary_shipment_id: "shp_005"
    });
    assert(
        Array.isArray(consolidated.shipments) && consolidated.shipments.length === 2,
        "consolidated DTO should serve two shipments"
    );

    console.log("Mock API smoke test passed.");
} finally {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
    await seedMockData();
}

async function get(path) {
    return request(path, {
        method: "GET"
    });
}

async function getRoot(path) {
    return requestRoot(path, {
        method: "GET"
    });
}

async function post(path, body) {
    return request(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}

async function request(path, options) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const payload = await response.json();

    if (!response.ok || payload.errors.length > 0) {
        throw new Error(`${options.method} ${path} failed: ${JSON.stringify(payload)}`);
    }

    return payload.data;
}

async function requestRoot(path, options) {
    const response = await fetch(`http://127.0.0.1:${port}/api${path}`, options);
    const payload = await response.json();

    if (!response.ok) {
        throw new Error(`${options.method} ${path} failed: ${JSON.stringify(payload)}`);
    }

    return payload.data;
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertScreenShape(screen, label) {
    assert(screen && typeof screen === "object", `${label} should be an object`);
    assert(typeof screen.order_info?.order_number === "string", `${label} should expose order_info.order_number`);
    assert(typeof screen.order_info?.status === "string", `${label} should expose order_info.status`);
    const summary = screen.task_summary;
    assert(
        summary
        && typeof summary.total_tasks === "number"
        && typeof summary.completed_tasks === "number"
        && typeof summary.blocked_tasks === "number"
        && typeof summary.required_tasks_remaining === "number",
        `${label} should expose a numeric task_summary`
    );
    assert(Array.isArray(screen.logistics_shipping?.missing_documents), `${label} should expose logistics_shipping.missing_documents`);
    assert("actual_entry_date" in (screen.warehouse_tracking || {}), `${label} should expose warehouse_tracking.actual_entry_date`);
}
