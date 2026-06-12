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
    const quotation = await post(`/delivery-orders/${deliveryOrder.id}/quotations`, {
        quotation_type: "FREIGHT"
    });
    await post(`/quotations/${quotation.id}/mark-final`, {});
    const shipment = await post("/shipments/from-delivery-order", {
        delivery_order_id: deliveryOrder.id
    });
    await get(`/shipments/${shipment.id}/milestones`);
    await post(`/shipments/${shipment.id}/milestones/CUSTOMS_CLEARED/done`, {});
    const declaration = await post(`/shipments/${shipment.id}/customs-declarations`, {});
    await post(`/customs-declarations/${declaration.id}/clear`, {});
    const carrierDeliveryOrder = await post(`/shipments/${shipment.id}/carrier-delivery-orders`, {});
    await post(`/carrier-delivery-orders/${carrierDeliveryOrder.id}/issue`, {});
    await post(`/carrier-delivery-orders/${carrierDeliveryOrder.id}/release`, {});
    await post(`/shipments/${shipment.id}/domestic-transport-orders`, {});
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
