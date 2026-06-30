import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = fileURLToPath(import.meta.url);
const dataDir = path.join(rootDir, "mock-data");
const docsDir = path.join(rootDir, "docs", "master_data");
const SEED_AT = "2026-06-30T00:00:00.000Z";

const oldItemToNewItem = {
    item_001: "item_008",
    item_002: "item_034",
    item_003: "item_004",
    item_004: "item_037",
    item_005: "item_008",
    item_006: "item_011",
    item_007: "item_028",
    item_008: "item_053",
    item_009: "item_026",
    item_010: "item_013",
    item_011: "item_011",
    item_012: "item_009",
    item_013: "item_034",
    item_014: "item_022"
};

const oldSupplierToNewSupplier = {
    sup_sdec: "sup_001",
    sup_shanghai_oem: "sup_012",
    sup_fds_forwarder: "sup_001",
    sup_vn_trucking: "sup_002",
    sup_haiphong_trucking: "sup_003",
    sup_north_trucking: "sup_004"
};

export async function reseedMasterData() {
    const [
        itemRows,
        supplierRows,
        forwarderRows,
        taskRows,
        chargeRows,
        uomRows
    ] = await Promise.all([
        parseSheet("01_Item_Master.html"),
        parseSheet("02_Supplier.html"),
        parseSheet("03_Forwarder.html"),
        parseSheet("04_Task_Template.html"),
        parseSheet("05_Charge_Code.html"),
        parseSheet("06_UOM.html")
    ]);

    const itemGroups = buildItemGroups();
    const items = buildItems(itemRows);
    const itemCustomsProfiles = buildItemCustomsProfiles(items);
    const suppliers = buildSuppliers(supplierRows);
    const supplierTransportModes = buildSupplierTransportModes(suppliers);
    const forwarders = buildForwarders(forwarderRows);
    const carriers = buildCarriers(forwarderRows);
    const taskTemplates = buildTaskTemplates(taskRows);
    const chargeCodes = buildChargeCodes(chargeRows);
    const uoms = buildUoms(uomRows);
    const currencies = buildCurrencies();
    const incoterms = buildIncoterms();

    await Promise.all([
        writeJson("currencies", currencies),
        writeJson("incoterms", incoterms),
        writeJson("item-groups", itemGroups),
        writeJson("item-master", items),
        writeJson("item-customs-profiles", itemCustomsProfiles),
        writeJson("suppliers", suppliers),
        writeJson("supplier-transport-modes", supplierTransportModes),
        writeJson("forwarders", forwarders),
        writeJson("carriers", carriers),
        writeJson("task-templates", taskTemplates),
        writeJson("charge-codes", chargeCodes),
        writeJson("uoms", uoms)
    ]);

    const remapSummary = await remapTransactionReferences({
        items,
        itemCustomsProfiles,
        suppliers,
        chargeCodes
    });

    return {
        collections: {
            currencies: currencies.length,
            incoterms: incoterms.length,
            "item-groups": itemGroups.length,
            "item-master": items.length,
            "item-customs-profiles": itemCustomsProfiles.length,
            suppliers: suppliers.length,
            "supplier-transport-modes": supplierTransportModes.length,
            forwarders: forwarders.length,
            carriers: carriers.length,
            "task-templates": taskTemplates.length,
            "charge-codes": chargeCodes.length,
            uoms: uoms.length
        },
        remap: remapSummary
    };
}

async function parseSheet(fileName) {
    const html = await fs.readFile(path.join(docsDir, fileName), "utf8");
    const rows = [];
    const rowMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

    for (const rowMatch of rowMatches) {
        const cells = [...rowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
            .map((cellMatch) => decodeCell(cellMatch[1]));

        if (cells.some(Boolean)) {
            rows.push(cells);
        }
    }

    return rows;
}

function decodeCell(value) {
    return value
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&ndash;|&mdash;/g, "-")
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/\s+/g, " ")
        .trim();
}

function audit(record) {
    return {
        create_at: SEED_AT,
        update_at: SEED_AT,
        delete_at: null,
        is_delete: false,
        ...record
    };
}

function buildItemGroups() {
    return [
        audit({ id: "grp_nvl", group_code: "NVL", group_name: "Nguyen vat lieu", description: "Raw materials used for manufacturing and import planning.", default_hs_code: "52081200", is_active: true }),
        audit({ id: "grp_btp", group_code: "BTP", group_name: "Ban thanh pham", description: "Semi-finished goods and components.", default_hs_code: "84099979", is_active: true }),
        audit({ id: "grp_tp", group_code: "TP", group_name: "Thanh pham", description: "Finished goods.", default_hs_code: "62052000", is_active: true }),
        audit({ id: "grp_ccdc", group_code: "CCDC", group_name: "Cong cu dung cu", description: "Tools and consumables.", default_hs_code: "82055900", is_active: true }),
        audit({ id: "grp_dong_goi", group_code: "DONG_GOI", group_name: "Vat tu dong goi", description: "Packaging materials.", default_hs_code: "48191000", is_active: true })
    ];
}

function buildItems(rows) {
    const dataRows = rows.filter((row) => /^(NVL|BTP|TP)-\d+/i.test(row[2] || ""));

    return dataRows.map((row, index) => {
        const itemCategory = upper(row[6]);
        const baseUom = upper(row[8]) || "PCS";
        const purchaseUom = upper(row[9]) || baseUom;

        return audit({
            id: formatId("item", index + 1),
            item_code: row[2].trim(),
            item_name: row[4].trim(),
            item_name_en: row[5].trim(),
            item_group_id: itemGroupId(itemCategory),
            item_category: itemCategory,
            item_type: upper(row[7]) || itemTypeFromCategory(itemCategory),
            base_uom: baseUom,
            purchase_uom: purchaseUom,
            uom_conversion: numberOrDefault(row[10], 1),
            hs_code: normalizeHsCode(row[11]),
            country_of_origin: upper(row[12]) || null,
            unit_price_usd: numberOrNull(row[13]),
            barcode: optionalString(row[14]),
            note: optionalString(row[15]),
            is_active: true
        });
    });
}

function buildItemCustomsProfiles(items) {
    return items.map((item, index) => {
        const dutyRate = inferDutyRate(item.hs_code, item.country_of_origin);
        const preferentialRate = item.country_of_origin === "CN" ? Math.max(0, dutyRate - 5) : null;

        return audit({
            id: formatId("icp", index + 1),
            item_id: item.id,
            hs_code: item.hs_code,
            import_duty_rate: dutyRate,
            vat_rate: 10,
            co_form: item.country_of_origin === "CN" ? "E" : null,
            co_tax_note: item.country_of_origin === "CN" ? "Preferential ACFTA rate may apply when C/O Form E is available." : null,
            customs_type: "IMPORT",
            customs_note: null,
            reference_doc_no: null,
            location_code: "VN",
            tax_note: null,
            preferential_import_duty_rate: preferentialRate,
            preferential_tax_rate: preferentialRate,
            is_default: true
        });
    });
}

function buildSuppliers(rows) {
    const dataRows = rows.filter((row) => /^SUP-\d+/i.test(row[2] || ""));

    return dataRows.map((row, index) => {
        const supplierType = upper(row[6]) || "OVERSEAS_SEA";
        const currencyCode = upper(row[13]) || "USD";
        const incotermCode = normalizeIncoterm(row[14]);
        const roles = ["SUPPLIER"];

        if (index === 0) {
            roles.push("FORWARDER");
        }

        if (index === 1 || index === 2 || supplierType === "DOMESTIC") {
            roles.push("TRUCKING_VENDOR");
        }

        return audit({
            id: formatId("sup", index + 1),
            supplier_code: row[2].trim(),
            supplier_name: row[4].trim(),
            supplier_name_en: optionalString(row[5]) ?? row[4].trim(),
            supplier_type: supplierType,
            supplier_roles: Array.from(new Set(roles)),
            country: upper(row[7]) || null,
            city: optionalString(row[8]),
            address: null,
            contact_person: optionalString(row[9]),
            contact_email: optionalString(row[10]),
            contact_phone: optionalString(row[11]),
            payment_term: normalizePaymentTerm(row[12], supplierType),
            default_currency_code: currencyCode,
            default_currency_id: currencyId(currencyCode),
            default_incoterm_code: incotermCode,
            default_incoterm_id: incotermId(incotermCode),
            lead_time_production_days: numberOrDefault(row[15], defaultLeadTime(supplierType)),
            bank_info: optionalString(row[16]),
            note: optionalString(row[17]),
            is_active: true
        });
    });
}

function buildSupplierTransportModes(suppliers) {
    const rows = [];

    for (const supplier of suppliers) {
        const modeIds = supplier.supplier_type === "OVERSEAS_AIR"
            ? ["tm_air"]
            : supplier.supplier_type === "DOMESTIC"
                ? ["tm_road"]
                : ["tm_sea"];

        if (supplier.supplier_roles.includes("FORWARDER")) {
            modeIds.push("tm_air", "tm_road");
        }

        for (const transportModeId of Array.from(new Set(modeIds))) {
            rows.push(audit({
                id: formatId("stm", rows.length + 1),
                supplier_id: supplier.id,
                transport_mode_id: transportModeId,
                service_level: transportModeId === "tm_air" ? "EXPRESS" : "STANDARD",
                is_default: rows.filter((row) => row.supplier_id === supplier.id).length === 0,
                is_active: true
            }));
        }
    }

    return rows;
}

function buildForwarders(rows) {
    const dataRows = rows.filter((row) => /^FWD-\d+/i.test(row[2] || ""));

    return dataRows.map((row, index) => audit({
        id: formatId("fwd", index + 1),
        forwarder_code: row[2].trim(),
        forwarder_name: row[4].trim(),
        forwarder_type: normalizeForwarderType(row[5]),
        country: upper(row[6]) || null,
        contact_person: optionalString(row[7]),
        contact_email: optionalString(row[8]),
        contact_phone: optionalString(row[9]),
        is_primary: yes(row[10]),
        note: optionalString(row[11]),
        is_active: true
    }));
}

function buildCarriers(rows) {
    const carrierRows = rows.filter((row) => {
        const code = row[2] || "";
        return /^\d+$/.test(row[1] || "") && code && !/^FWD-\d+/i.test(code) && row[4] && row[5];
    });

    return carrierRows.map((row, index) => audit({
        id: formatId("carr", index + 1),
        carrier_code: row[2].trim(),
        carrier_name: row[4].trim(),
        carrier_type: normalizeCarrierType(row[5]),
        scac_iata_code: optionalString(row[6]),
        service_route_note: optionalString(row[7]),
        contact_booking: optionalString(row[8]),
        contact_email: optionalString(row[9]),
        note: optionalString(row[10]),
        is_active: true
    }));
}

function buildTaskTemplates(rows) {
    const dataRows = rows.filter((row) => /^\d+$/.test(row[1] || "") && row[2] && row[4]);

    return dataRows.map((row, index) => audit({
        id: formatId("tt", index + 1),
        group_code: taskGroupCode(row[2]),
        group_name: row[2].trim(),
        task_name: row[4].trim(),
        task_description: row[5].trim(),
        milestone_code: milestoneCode(row[6]),
        sla_hours: numberOrNull(row[7]),
        sla_text: Number.isFinite(Number(row[7])) ? null : optionalString(row[7]),
        department: departmentCode(row[8]),
        assignee_role: optionalString(row[9]),
        required_documents: optionalString(row[10]),
        note: optionalString(row[11]),
        sort_order: index + 1,
        is_active: true
    }));
}

// Maps doc section headers to canonical macro group enum values.
const CHARGE_GROUP_TO_ENUM = {
    "ORIGIN / EXPORT": "ORIGIN_EXPORT",
    "MAIN FREIGHT (CARRIAGE)": "MAIN_FREIGHT",
    "FREIGHT SURCHARGES": "FREIGHT_SURCHARGE",
    "DOCUMENTATION & FILING": "DOCUMENTATION_FILING",
    "DESTINATION / IMPORT": "DESTINATION_IMPORT",
    "ANCILLARY / ACCESSORIAL": "ANCILLARY_ACCESSORIAL",
    "SERVICE / OTHER": "SERVICE_OTHER",
};

const CHARGE_CATEGORY_TO_ENUM = {
    Origin: "ORIGIN",
    Customs: "CUSTOMS",
    Documentation: "DOCUMENTATION",
    Freight: "FREIGHT",
    Surcharge: "SURCHARGE",
    Destination: "DESTINATION",
    Disbursement: "DISBURSEMENT",
    Ancillary: "ANCILLARY",
    Service: "SERVICE",
};

function buildChargeCodes(rows) {
    const counters = new Map();
    const result = [];
    let currentGroup = "MAIN_FREIGHT";

    for (const rawRow of rows) {
        // Strip leading row-number cell if present
        const row = /^\d+$/.test(rawRow[0] || "") ? rawRow.slice(1) : rawRow;

        // Detect section header row: single non-empty cell matching a known group
        if (row.filter(Boolean).length === 1) {
            const header = (row.find(Boolean) || "").replace(/&amp;/g, "&").trim();
            if (CHARGE_GROUP_TO_ENUM[header]) {
                currentGroup = CHARGE_GROUP_TO_ENUM[header];
                continue;
            }
        }

        // Skip non-data rows
        if (!/^[A-Z0-9]{2,8}$/i.test(row[0] || "") || row.length < 12) continue;

        const chargeCode = upper(row[0]);
        const seen = counters.get(chargeCode) || 0;
        counters.set(chargeCode, seen + 1);

        // The source sheet reuses some codes (e.g. EXC) for two distinct charges.
        // Keep charge_code unique for the master so it is safe as a select value / FK.
        const uniqueChargeCode = seen ? `${chargeCode}-${seen + 1}` : chargeCode;

        result.push(audit({
            id: `chg_${slug(chargeCode)}${seen ? `_${seen + 1}` : ""}`,
            charge_code: uniqueChargeCode,
            charge_name_en: row[1].trim(),
            charge_name_vn: row[2].trim(),
            group: currentGroup,
            category: normalizeChargeCategory(row[3]),
            default_uom: upper(row[4]) || "SHPT",
            sea_fcl: yes(row[5]),
            sea_lcl: yes(row[6]),
            air: yes(row[7]),
            road: yes(row[8]),
            rail: yes(row[9]),
            rev_cost: normalizeRevCost(row[10]),
            taxable: yes(row[11]),
            description: optionalString(row[12]),
            is_active: true
        }));
    }

    return result;
}

function buildUoms(rows) {
    const dataRows = rows
        .map((row) => (/^\d+$/.test(row[0] || "") ? row.slice(1) : row))
        .filter((row) => /^[A-Z0-9]{2,8}$/i.test(row[0] || "") && row[1]);

    const uoms = dataRows.map((row) => audit({
        id: `uom_${slug(row[0])}`,
        uom_code: upper(row[0]),
        uom_name_en: row[1].trim(),
        uom_name_vn: row[2].trim(),
        description: optionalString(row[3]),
        is_active: true
    }));

    return uoms;
}

function buildCurrencies() {
    return [
        audit({ id: "cur_vnd", currency_code: "VND", currency_name: "Vietnam Dong", symbol: "VND", exchange_rate_to_vnd: 1, decimal_places: 0, is_active: true }),
        audit({ id: "cur_usd", currency_code: "USD", currency_name: "US Dollar", symbol: "$", exchange_rate_to_vnd: 25000, decimal_places: 2, is_active: true }),
        audit({ id: "cur_cny", currency_code: "CNY", currency_name: "Chinese Yuan", symbol: "CNY", exchange_rate_to_vnd: 3500, decimal_places: 2, is_active: true }),
        audit({ id: "cur_eur", currency_code: "EUR", currency_name: "Euro", symbol: "EUR", exchange_rate_to_vnd: 27000, decimal_places: 2, is_active: true }),
        audit({ id: "cur_krw", currency_code: "KRW", currency_name: "South Korean Won", symbol: "KRW", exchange_rate_to_vnd: 19, decimal_places: 0, is_active: true })
    ];
}

function buildIncoterms() {
    return [
        audit({ id: "inc_exw", incoterm_code: "EXW", incoterm_name: "Ex Works", description: "Supplier makes goods available at origin.", is_active: true }),
        audit({ id: "inc_fca", incoterm_code: "FCA", incoterm_name: "Free Carrier", description: "Supplier delivers goods to the carrier at a named place.", is_active: true }),
        audit({ id: "inc_fob", incoterm_code: "FOB", incoterm_name: "Free On Board", description: "Supplier loads goods at port of loading.", is_active: true }),
        audit({ id: "inc_cfr", incoterm_code: "CFR", incoterm_name: "Cost and Freight", description: "Supplier pays freight to destination port; buyer pays destination charges.", is_active: true }),
        audit({ id: "inc_cif", incoterm_code: "CIF", incoterm_name: "Cost, Insurance and Freight", description: "Supplier pays freight and insurance to destination port.", is_active: true }),
        audit({ id: "inc_ddp", incoterm_code: "DDP", incoterm_name: "Delivered Duty Paid", description: "Seller delivers cleared goods to destination.", is_active: true })
    ];
}

async function remapTransactionReferences(master) {
    const itemById = new Map(master.items.map((item) => [item.id, item]));
    const itemProfileByItemId = new Map(master.itemCustomsProfiles.map((profile) => [profile.item_id, profile]));
    const chargeCodeByCode = new Map(master.chargeCodes.map((charge) => [charge.charge_code, charge]));
    const summary = {};

    const purchaseOrderLines = await readJson("purchase-order-lines");
    const remappedPurchaseOrderLines = purchaseOrderLines.map((line) => remapPurchaseOrderLine(line, itemById, itemProfileByItemId));
    await writeJson("purchase-order-lines", remappedPurchaseOrderLines);
    summary["purchase-order-lines"] = remappedPurchaseOrderLines.length;

    const purchaseOrderLineById = new Map(remappedPurchaseOrderLines.map((line) => [line.id, line]));
    await remapItemLineCollection("po-lot-lines", purchaseOrderLineById, itemById, summary);
    await remapItemLineCollection("delivery-order-lines", purchaseOrderLineById, itemById, summary);
    await remapItemLineCollection("shipment-lines", purchaseOrderLineById, itemById, summary);
    await remapItemLineCollection("domestic-transport-order-lines", purchaseOrderLineById, itemById, summary);
    await remapCustomsDeclarationLines(itemById, itemProfileByItemId, summary);

    await remapSupplierCollection("purchase-orders", summary);
    await remapSupplierCollection("quotations", summary);
    await remapSupplierCollection("shipments", summary);
    await remapSupplierCollection("carrier-delivery-orders", summary);
    await remapSupplierCollection("domestic-transport-orders", summary);

    const chargeLines = await readJson("quotation-charge-lines");
    const remappedChargeLines = chargeLines.map((line, index) => remapChargeLine(line, chargeCodeByCode, index));
    await writeJson("quotation-charge-lines", remappedChargeLines);
    summary["quotation-charge-lines"] = remappedChargeLines.length;

    return summary;
}

function remapPurchaseOrderLine(line, itemById, itemProfileByItemId) {
    const itemId = resolveItemId(line.item_id, line, itemById);
    const item = itemById.get(itemId);
    const profile = itemProfileByItemId.get(itemId);

    if (!item) {
        return line;
    }

    return {
        ...line,
        update_at: SEED_AT,
        item_id: item.id,
        item_customs_profile_id: profile?.id ?? line.item_customs_profile_id ?? null,
        item_code: item.item_code,
        item_description: item.item_name_en || item.item_name,
        hs_code: item.hs_code,
        unit: item.base_uom || line.unit
    };
}

async function remapItemLineCollection(collectionName, purchaseOrderLineById, itemById, summary) {
    const rows = await readJson(collectionName);
    const remappedRows = rows.map((row) => {
        const poLine = purchaseOrderLineById.get(row.purchase_order_line_id);
        const itemId = poLine?.item_id ?? resolveItemId(row.item_id, row, itemById);
        const item = itemById.get(itemId);

        if (!item) {
            return row;
        }

        return {
            ...row,
            update_at: SEED_AT,
            item_id: item.id,
            unit: item.base_uom || row.unit
        };
    });

    await writeJson(collectionName, remappedRows);
    summary[collectionName] = remappedRows.length;
}

async function remapCustomsDeclarationLines(itemById, itemProfileByItemId, summary) {
    const rows = await readJson("customs-declaration-lines");
    const remappedRows = rows.map((row) => {
        const itemId = resolveItemId(row.item_id, row, itemById);
        const item = itemById.get(itemId);
        const profile = itemProfileByItemId.get(itemId);

        if (!item || !profile) {
            return row;
        }

        return {
            ...row,
            update_at: SEED_AT,
            item_id: item.id,
            hs_code: profile.hs_code,
            item_description: item.item_name_en || item.item_name,
            unit: item.base_uom || row.unit,
            import_duty_rate: profile.import_duty_rate,
            vat_rate: profile.vat_rate,
            co_form: profile.co_form,
            preferential_tax_rate: profile.preferential_import_duty_rate
        };
    });

    await writeJson("customs-declaration-lines", remappedRows);
    summary["customs-declaration-lines"] = remappedRows.length;
}

async function remapSupplierCollection(collectionName, summary) {
    const rows = await readJson(collectionName);
    const remappedRows = rows.map((row) => remapSupplierReferences(row));

    await writeJson(collectionName, remappedRows);
    summary[collectionName] = remappedRows.length;
}

function remapSupplierReferences(row) {
    const next = { ...row };
    let changed = false;

    for (const key of ["supplier_id", "forwarder_id", "truck_vendor_id"]) {
        if (next[key] && oldSupplierToNewSupplier[next[key]]) {
            next[key] = oldSupplierToNewSupplier[next[key]];
            changed = true;
        }
    }

    return changed ? { ...next, update_at: SEED_AT } : row;
}

function remapChargeLine(line, chargeCodeByCode, index) {
    const code = line.charge_code && chargeCodeByCode.has(line.charge_code)
        ? line.charge_code
        : chargeCodeForType(line.charge_type, line, chargeCodeByCode);
    const charge = chargeCodeByCode.get(code);
    const quantity = Number(line.quantity ?? 1);
    const unitPrice = Number(line.unit_price ?? line.amount ?? 0);
    const amount = Number(line.amount ?? quantity * unitPrice);
    const taxRate = Number(line.tax_rate ?? (charge?.taxable ? 10 : 0));
    const taxAmount = Number(line.tax_amount ?? amount * taxRate / 100);

    return {
        ...line,
        update_at: SEED_AT,
        line_no: line.line_no ?? index + 1,
        charge_code: code,
        description: line.description || charge?.charge_name_en || null,
        quantity,
        unit: line.unit || charge?.default_uom || "SHPT",
        unit_price: unitPrice,
        amount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: Number(line.total_amount ?? amount + taxAmount)
    };
}

function chargeCodeForType(chargeType, line, chargeCodeByCode) {
    const description = String(line.description || "").toLowerCase();
    const map = {
        AIR_FREIGHT: "AFR",
        BREAKBULK_FREIGHT: "OFR",
        ORIGIN_CHARGE: "PRE",
        LOCAL_CHARGE: "THC",
        CUSTOMS_FEE: "IMC",
        TRUCKING: "LMD",
        DO_FEE: "DOF",
        HANDLING: "HDL",
        THC: "DTH",
        CIC: "CIC",
        EMC_EMF: "BAF",
        CLEANING: "CLN",
        CFS: "DTL",
        LOWERING_FEE: "LOL",
        LOADING_FEE: "HDL",
        DEMURRAGE: "DEM",
        DETENTION: "DET",
        WAREHOUSE: "STO",
        DOCUMENT_FEE: "BLF",
        OTHER: "HDL"
    };

    if (chargeType === "OCEAN_FREIGHT") {
        return description.includes("lcl") || String(line.unit || "").toUpperCase() === "WM" ? "OFL" : "OFR";
    }

    const mapped = map[chargeType] || "HDL";
    return chargeCodeByCode.has(mapped) ? mapped : "HDL";
}

function normalizeChargeCategory(value) {
    const label = String(value || "").trim();
    return CHARGE_CATEGORY_TO_ENUM[label] || upper(label);
}

function resolveItemId(currentId, row, itemById) {
    const currentItem = itemById.get(currentId);
    const snapshot = [
        row.item_code,
        row.item_description,
        row.description,
        row.item_name
    ].filter(Boolean).join(" ").toLowerCase();

    if (currentItem && snapshot) {
        const currentTokens = [
            currentItem.item_code,
            currentItem.item_name,
            currentItem.item_name_en
        ].filter(Boolean).map((value) => String(value).toLowerCase());

        if (currentTokens.some((token) => snapshot.includes(token))) {
            return currentId;
        }
    }

    if (oldItemToNewItem[currentId]) {
        return oldItemToNewItem[currentId];
    }

    return currentId;
}

function itemGroupId(category) {
    const map = {
        NVL: "grp_nvl",
        BTP: "grp_btp",
        TP: "grp_tp",
        CCDC: "grp_ccdc",
        DONG_GOI: "grp_dong_goi"
    };
    return map[category] || "grp_btp";
}

function itemTypeFromCategory(category) {
    const map = {
        NVL: "RAW",
        BTP: "SEMI",
        TP: "FG",
        CCDC: "CONSUMABLE",
        DONG_GOI: "PACKAGING"
    };
    return map[category] || "SEMI";
}

function inferDutyRate(hsCode, country) {
    if (country === "VN") {
        return 0;
    }

    if (/^(84|85)/.test(hsCode)) {
        return 5;
    }

    if (/^(52|54|62)/.test(hsCode)) {
        return 12;
    }

    if (/^(39|40|48|73|83)/.test(hsCode)) {
        return 10;
    }

    return 8;
}

function normalizeIncoterm(value) {
    const incoterm = upper(value);
    return ["EXW", "FCA", "FOB", "CFR", "CIF", "DDP"].includes(incoterm) ? incoterm : "FOB";
}

function incotermId(code) {
    return `inc_${String(code || "FOB").toLowerCase()}`;
}

function currencyId(code) {
    return `cur_${String(code || "USD").toLowerCase()}`;
}

function normalizePaymentTerm(value, supplierType) {
    const normalized = upper(value);
    const supported = new Set(["NET30", "NET45", "NET60", "TT_ADVANCE", "LC"]);

    if (supported.has(normalized)) {
        return normalized;
    }

    if (normalized.includes("LC")) {
        return "LC";
    }

    if (normalized.includes("45")) {
        return "NET45";
    }

    if (normalized.includes("60")) {
        return "NET60";
    }

    if (normalized.includes("30")) {
        return "NET30";
    }

    return supplierType === "DOMESTIC" ? "NET30" : "TT_ADVANCE";
}

function defaultLeadTime(supplierType) {
    if (supplierType === "OVERSEAS_AIR") {
        return 7;
    }

    if (supplierType === "DOMESTIC") {
        return 3;
    }

    return 30;
}

function normalizeForwarderType(value) {
    const normalized = upper(value);

    if (normalized.includes("MULTI") || normalized.includes("/")) {
        return "MULTI";
    }

    if (normalized.includes("AIR")) {
        return "AIR";
    }

    if (normalized.includes("TRUCK")) {
        return "TRUCKING";
    }

    return "SEA";
}

function normalizeCarrierType(value) {
    const normalized = upper(value);

    if (normalized.includes("AIR")) {
        return "AIRLINE";
    }

    if (normalized.includes("TRUCK")) {
        return "TRUCKING";
    }

    if (normalized.includes("RAIL")) {
        return "RAIL";
    }

    return "SHIPPING_LINE";
}

function taskGroupCode(groupName) {
    const groups = [
        "Bao gia",
        "PO",
        "Booking",
        "Chung tu",
        "Hai quan",
        "Giao hang",
        "Quyet toan"
    ];
    const normalized = stripAccent(groupName).toLowerCase();
    const index = groups.findIndex((group) => normalized.includes(stripAccent(group).toLowerCase()));
    return `GR${String(index >= 0 ? index + 1 : 0).padStart(2, "0")}`;
}

function milestoneCode(value) {
    const normalized = stripAccent(value).toLowerCase();

    if (normalized.includes("ms-1")) return "MS1_BOOKING_CONFIRMED";
    if (normalized.includes("ms-2")) return "MS2_CARGO_READY";
    if (normalized.includes("ms-3")) return "MS3_LOADED";
    if (normalized.includes("ms-4")) return "MS4_IN_TRANSIT";
    if (normalized.includes("ms-5")) return "MS5_ARRIVED_PORT";
    if (normalized.includes("ms-6")) return "MS6_CUSTOMS_SUBMITTED";
    if (normalized.includes("ms-7")) return "MS7_CUSTOMS_CLEARED";
    if (normalized.includes("ms-8")) return "MS8_DELIVERED_GATE";
    return "PRE_SHIPMENT";
}

function departmentCode(value) {
    const normalized = stripAccent(value).toLowerCase();

    if (normalized.includes("fds sales")) return "FDS_SALES";
    if (normalized.includes("kbi")) return "KBI_PURCHASING";
    if (normalized.includes("ke toan")) return "FDS_ACCOUNTING";
    if (normalized.includes("customs") || normalized.includes("hai quan")) return "FDS_OPS_CUSTOMS";
    if (normalized.includes("warehouse") || normalized.includes("kho")) return "KBI_WAREHOUSE";
    return "FDS_OPS";
}

function normalizeRevCost(value) {
    const normalized = upper(value);

    if (normalized.includes("BOTH")) return "BOTH";
    if (normalized.includes("COST")) return "COST";
    return "REVENUE";
}

function normalizeHsCode(value) {
    const code = String(value || "").replace(/\D/g, "");
    return code ? code.padEnd(8, "0").slice(0, 8) : "00000000";
}

function numberOrNull(value) {
    const numeric = Number(String(value || "").replace(/,/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
}

function numberOrDefault(value, fallback) {
    const numeric = numberOrNull(value);
    return numeric ?? fallback;
}

function optionalString(value) {
    const trimmed = String(value || "").trim();
    return trimmed ? trimmed : null;
}

function upper(value) {
    return String(value || "").trim().toUpperCase();
}

function yes(value) {
    return ["Y", "YES", "TRUE", "1"].includes(upper(value));
}

function slug(value) {
    return stripAccent(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function stripAccent(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatId(prefix, value) {
    return `${prefix}_${String(value).padStart(3, "0")}`;
}

async function readJson(collectionName) {
    const filePath = path.join(dataDir, `${collectionName}.json`);

    try {
        const raw = await fs.readFile(filePath, "utf8");
        return JSON.parse(raw);
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }
        throw error;
    }
}

async function writeJson(collectionName, rows) {
    const filePath = path.join(dataDir, `${collectionName}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

if (process.argv[1] === scriptPath) {
    reseedMasterData()
        .then((summary) => {
            console.log(JSON.stringify(summary, null, 2));
        })
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
}
