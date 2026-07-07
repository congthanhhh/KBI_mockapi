const RFQ_STATUSES_FROM_QUOTATION = {
    DRAFT: "RECEIVED",
    PENDING_APPROVAL: "QUOTED",
    PENDING_ADJUSTMENT: "QUOTED",
    CONFIRMED: "CONFIRMED",
    REJECTED: "QUOTED"
};

const rfqSpecs = [
    ["qr-0001", "SUBMITTED", "2026-07-07T09:30:00+07:00", "sup_001", "SEA_FCL", "Shanghai (CNSHA)", "Hai Phong (VNHPH)", "2026-07-21", 5400, 58, "1x40HC", [["item_004", "Bo dieu khien KBI7921C-CAN", 500, "PCS", 82.5, 3600], ["item_005", "Bo sac LBC1206B", 300, "PCS", 20.4, 1800]]],
    ["qr-0002", "SUBMITTED", "2026-07-06T14:10:00+07:00", "sup_002", "AIR", "Shanghai PVG", "Ha Noi HAN", "2026-07-16", 620, 4.8, "AIR loose cargo", [["item_029", "Cam bien nhien lieu KUS MGS-E870", 240, "PCS", 12.5, 420], ["item_030", "Cam bien nhien lieu KUS CLS2-E790", 120, "PCS", 13.2, 200]]],
    ["qr-0003", "CANCELLED", "2026-07-05T11:20:00+07:00", "sup_003", "SEA_LCL", "Qingdao (CNQDG)", "Cat Lai (VNCLI)", "2026-07-19", 870, 7.4, "LCL", [["item_034", "Loc tach nuoc cho may CS 50kVA-500kVA", 150, "PCS", 18.4, 870]]],
    ["qr-0004", "RECEIVED", "2026-07-04T15:40:00+07:00", "sup_004", "SEA_LCL", "Ningbo (CNNGB)", "Cat Lai (VNCLI)", "2026-07-22", 1440, 9.5, "LCL", [["item_017", "Cam bien nhiet do nuoc KUS KE-00141", 320, "PCS", 11.8, 640], ["item_018", "CB ap luc nhot KUS KE-21111", 260, "PCS", 13.7, 800]]],
    ["qr-0005", "RECEIVED", "2026-07-03T10:05:00+07:00", "sup_005", "SEA_FCL", "Shekou (CNSHK)", "Hai Phong (VNHPH)", "2026-07-24", 7600, 63, "1x40HC", [["item_008", "Dong co dau SDEC 4Z2.3-G21", 18, "SET", 890, 7600]]],
    ["qr-0006", "RECEIVED", "2026-07-02T16:35:00+07:00", "sup_006", "AIR", "Guangzhou CAN", "Ho Chi Minh SGN", "2026-07-15", 390, 3.2, "AIR loose cargo", [["item_037", "Bom dien 12VDC HEP-02A", 160, "PCS", 7.6, 390]]],
    ["qr-0007", "QUOTED", "2026-07-01T13:50:00+07:00", "sup_001", "SEA_FCL", "Shanghai (CNSHA)", "Cat Lai (VNCLI)", "2026-07-23", 6200, 55, "1x40HC", [["item_011", "Dau phat Kibii KBI 184ES", 12, "SET", 1240, 6200]]],
    ["qr-0008", "QUOTED", "2026-06-30T09:45:00+07:00", "sup_002", "SEA_LCL", "Wenzhou (CNWNZ)", "Cat Lai (VNCLI)", "2026-07-18", 980, 8.7, "LCL", [["item_024", "O cam Kripal 63A", 420, "PCS", 8.1, 520], ["item_025", "Phich cam Kripal 63A", 390, "PCS", 7.4, 460]]],
    ["qr-0009", "QUOTED", "2026-06-29T17:05:00+07:00", "sup_004", "AIR", "Shanghai PVG", "Ha Noi HAN", "2026-07-12", 720, 5.1, "AIR loose cargo", [["item_022", "Bo dieu khien Deepsea DSE6120 MKIII AMF", 140, "PCS", 95, 500], ["item_023", "Bo chuyen doi Deepsea DSE0857-01", 160, "PCS", 18.5, 220]]],
    ["qr-0010", "QUOTED", "2026-06-28T10:25:00+07:00", "sup_005", "SEA_FCL", "Xiamen (CNXMN)", "Hai Phong (VNHPH)", "2026-07-20", 6800, 52, "1x40GP", [["item_026", "Ket nuoc 4C - D1803", 42, "PCS", 142, 3600], ["item_027", "Ket nuoc 4C-V2203/V2403", 38, "PCS", 158, 3200]]],
    ["qr-0011", "QUOTED", "2026-06-27T15:15:00+07:00", "sup_006", "SEA_LCL", "Ningbo (CNNGB)", "Cat Lai (VNCLI)", "2026-07-14", 760, 6.1, "LCL", [["item_035", "Khoa cua Kangpa MS866-7B", 320, "PCS", 9.2, 410], ["item_036", "Khoa cua Kangpa MS866A-2", 180, "PCS", 11.4, 350]]],
    ["qr-0012", "QUOTED", "2026-06-25T08:55:00+07:00", "sup_007", "AIR", "Hong Kong HKG", "Ho Chi Minh SGN", "2026-07-10", 310, 2.9, "AIR loose cargo", [["item_038", "Thiet bi chong set MCCB JVMM6-125 4P", 96, "PCS", 28.5, 180], ["item_039", "Thiet bi chong set MCCB JVMM6-125 2P", 88, "PCS", 18.2, 130]]],
    ["qr-0013", "CONFIRMED", "2026-06-24T14:35:00+07:00", "sup_001", "SEA_FCL", "Shanghai (CNSHA)", "Hai Phong (VNHPH)", "2026-07-13", 5900, 48, "1x40HC", [["item_012", "Ro le TRV4 L-12V(R1)-H-F", 1300, "PCS", 1.95, 1200], ["item_013", "Ron kep co thep 25mm", 2400, "PCS", 0.72, 4700]]],
    ["qr-0014", "CONFIRMED", "2026-06-20T10:30:00+07:00", "sup_008", "SEA_LCL", "Qingdao (CNQDG)", "Cat Lai (VNCLI)", "2026-07-08", 1020, 7.8, "LCL", [["item_040", "Jack cam H66L5-2P", 900, "PCS", 2.7, 420], ["item_041", "Jack cam H66L6-2P", 760, "PCS", 3.1, 600]]],
    ["qr-0015", "CONFIRMED", "2026-06-15T09:05:00+07:00", "sup_004", "AIR", "Shanghai PVG", "Ha Noi HAN", "2026-07-05", 455, 3.4, "AIR loose cargo", [["item_019", "Cam bien nhien lieu KUS CL2-415mm", 220, "PCS", 10.4, 220], ["item_020", "Cam bien nhien lieu KUS CL2-555mm", 210, "PCS", 11.1, 235]]]
];

const quotationSpecs = [
    ["qt_020", "qr-0004", "DRAFT", "2026-07-07T11:20:00+07:00", false],
    ["qt_021", "qr-0004", "DRAFT", "2026-07-04T16:25:00+07:00", false],
    ["qt_022", "qr-0005", "DRAFT", "2026-07-03T11:10:00+07:00", false],
    ["qt_023", "qr-0006", "DRAFT", "2026-07-02T17:20:00+07:00", false],
    ["qt_024", "qr-0007", "PENDING_APPROVAL", "2026-07-01T15:00:00+07:00", true],
    ["qt_025", "qr-0008", "PENDING_APPROVAL", "2026-06-30T11:30:00+07:00", true],
    ["qt_026", "qr-0009", "PENDING_APPROVAL", "2026-06-29T18:15:00+07:00", true],
    ["qt_027", "qr-0010", "PENDING_ADJUSTMENT", "2026-06-28T12:40:00+07:00", false],
    ["qt_028", "qr-0011", "REJECTED", "2026-06-27T16:05:00+07:00", false],
    ["qt_029", "qr-0012", "REJECTED", "2026-06-25T10:20:00+07:00", false],
    ["qt_030", "qr-0013", "CONFIRMED", "2026-06-24T16:00:00+07:00", true],
    ["qt_031", "qr-0014", "CONFIRMED", "2026-06-20T12:20:00+07:00", true],
    ["qt_032", "qr-0015", "CONFIRMED", "2026-06-15T10:40:00+07:00", true]
];

// Extra REJECTED versions (v2/v3) FDS created via "Sửa phương án và chi phí" after KBI rejected.
// [newId, baseQuotationId, version, at, priceFactor] — all REJECTED; priceFactor drops so v1 > v2 > v3.
const versionSpecs = [
    ["qt_033", "qt_028", 2, "2026-06-27T18:30:00+07:00", 0.94],
    ["qt_034", "qt_028", 3, "2026-06-28T09:15:00+07:00", 0.88],
    ["qt_035", "qt_029", 2, "2026-06-25T14:40:00+07:00", 0.93],
    ["qt_036", "qt_029", 3, "2026-06-26T08:50:00+07:00", 0.86]
];

export function applyRfqQuotationDemoData(seedFiles, base) {
    const rfqs = rfqSpecs.map((spec) => buildRfq(spec, base));
    const rfqById = new Map(rfqs.map((rfq) => [rfq.id, rfq]));
    const built = quotationSpecs.map((spec, index) => buildQuotationBundle(spec, index, rfqById, base));
    const builtById = new Map(built.map((item) => [item.quotation.id, item]));
    const versionBundles = versionSpecs.map((spec, index) => buildVersionBundle(spec, index, builtById, base));
    const allBundles = [...built, ...versionBundles];
    const standaloneIds = new Set(allBundles.map((item) => item.quotation.id));
    const legacyQuotationIds = new Set((seedFiles["quotations"] || [])
        .filter((quotation) => quotation.ref_type != null && !standaloneIds.has(quotation.id))
        .map((quotation) => quotation.id));

    const standaloneChargeLines = allBundles.flatMap((item) => item.chargeLines);

    seedFiles["quotation-requests"] = rfqs;
    seedFiles["quotation-request-lines"] = buildRfqLines(base);
    seedFiles["quotations"] = [
        ...(seedFiles["quotations"] || []).filter((quotation) => legacyQuotationIds.has(quotation.id)),
        ...allBundles.map((item) => item.quotation)
    ];
    seedFiles["quotation-options"] = [
        ...(seedFiles["quotation-options"] || []).filter((option) => legacyQuotationIds.has(option.quotation_id)),
        ...allBundles.flatMap((item) => item.options)
    ];
    seedFiles["quotation-charge-lines"] = [
        ...(seedFiles["quotation-charge-lines"] || []).filter((line) => legacyQuotationIds.has(line.quotation_id)),
        ...standaloneChargeLines
    ];
    seedFiles["quotation-line-adjustments"] = buildAdjustments(standaloneChargeLines, base);
    seedFiles["quotation-events"] = [
        ...(seedFiles["quotation-events"] || []).filter((event) => legacyQuotationIds.has(event.quotation_id)),
        ...allBundles.flatMap((item, index) => buildQuotationEvents(item.quotation, index, base))
    ];

    zeroQuotationTaxes(seedFiles);
}

function zeroQuotationTaxes(seedFiles) {
    seedFiles["quotation-charge-lines"] = (seedFiles["quotation-charge-lines"] || []).map((line) => {
        const amount = roundNumber(Number(line.amount ?? Number(line.quantity || 0) * Number(line.unit_price || 0)));
        return {
            ...line,
            amount,
            tax_rate: 0,
            tax_amount: 0,
            total_amount: amount
        };
    });

    const totalsByQuotationId = new Map();
    for (const line of seedFiles["quotation-charge-lines"]) {
        totalsByQuotationId.set(line.quotation_id, roundNumber((totalsByQuotationId.get(line.quotation_id) || 0) + Number(line.amount || 0)));
    }

    seedFiles["quotations"] = (seedFiles["quotations"] || []).map((quotation) => {
        const total = totalsByQuotationId.has(quotation.id)
            ? totalsByQuotationId.get(quotation.id)
            : roundNumber(Number(quotation.total_amount || 0));
        return {
            ...quotation,
            total_amount: total,
            total_tax_amount: 0,
            grand_total_amount: total
        };
    });
}

function buildRfq(spec, base) {
    const [id, status, at, supplier_id, mode, origin_port, destination_port, readyDate, gross_weight_kg, volume_cbm, container_type] = spec;
    return base({
        id,
        rfq_no: `RFQ-2026-${id.slice(-4)}`,
        status,
        customer_ref: "KBI",
        customer_po_ref: `KBI-SAP-PO-450001${2600 + Number(id.slice(-4))}`,
        customer_contract_ref: `KBI-CON-2026-${id.slice(-4)}`,
        supplier_id,
        incoterm_code: "FOB",
        mode,
        currency_code: "USD",
        origin_port,
        destination_port,
        desired_cargo_ready_date: readyDate,
        gross_weight_kg,
        volume_cbm,
        container_type,
        note: rfqNote(status),
        create_at: at,
        update_at: at
    });
}

function buildRfqLines(base) {
    let lineNo = 1;
    return rfqSpecs.flatMap((spec) => {
        const [requestId,,,,,,,,, volumeCbm,, lines] = spec;
        return lines.map((line, index) => {
            const [item_id, item_description, qty, unit, unit_price, gross_weight_kg] = line;
            const at = spec[2];
            return base({
                id: `qrl-${String(lineNo++).padStart(4, "0")}`,
                quotation_request_id: requestId,
                line_no: index + 1,
                item_id,
                item_description,
                qty,
                unit,
                unit_price,
                gross_weight_kg,
                length_cm: spec[4] === "AIR" ? 60 : 120,
                width_cm: spec[4] === "AIR" ? 45 : 100,
                height_cm: spec[4] === "AIR" ? 40 : 110,
                cbm: Number((volumeCbm / lines.length).toFixed(3)),
                note: null,
                create_at: at,
                update_at: at
            });
        });
    });
}

function buildQuotationBundle(spec, index, rfqById, base) {
    const [id, rfqId, status, at, shouldSelect, fallback = {}] = spec;
    const context = rfqId ? rfqById.get(rfqId) : {
        customer_ref: "KBI",
        supplier_id: fallback.supplier_id,
        incoterm_code: "FOB",
        mode: fallback.mode,
        currency_code: "USD",
        origin_port: fallback.origin_port,
        destination_port: fallback.destination_port,
        gross_weight_kg: fallback.gross_weight_kg,
        volume_cbm: fallback.volume_cbm
    };
    const options = buildOptions(id, context, index, at, shouldSelect, base);
    const chargeLines = buildChargeLines(id, context, index, at, base);
    const totals = quotationTotals(chargeLines);
    const selected_option_id = shouldSelect ? options[0].id : null;
    const quoted_at = status === "DRAFT" ? null : at;

    return {
        quotation: base({
            id,
            quotation_group_id: `qg_${id}`,
            quotation_no: `QT-KBI-2026-${String(20 + index).padStart(3, "0")}`,
            version: 1,
            ref_type: null,
            ref_id: null,
            rfq_id: rfqId,
            customer_ref: "KBI",
            supplier_id: context.supplier_id,
            quotation_type: "FREIGHT",
            incoterm_code: context.incoterm_code || "FOB",
            mode: context.mode,
            origin_port: context.origin_port,
            destination_port: context.destination_port,
            selected_option_id,
            currency_code: context.currency_code || "USD",
            exchange_rate: 25000,
            status,
            is_final: status === "CONFIRMED",
            confirmed_at: status === "CONFIRMED" ? at : null,
            rejected_at: status === "REJECTED" ? at : null,
            reject_reason: status === "REJECTED" ? "KBI từ chối toàn bộ báo giá, đề nghị FDS chào lại giá tốt hơn." : null,
            quoted_at,
            valid_until: quoted_at ? addDays(at, 21) : null,
            note: quotationNote(status, rfqId),
            ...totals,
            create_at: at,
            update_at: at
        }),
        options,
        chargeLines
    };
}

function buildVersionBundle(spec, versionIndex, builtById, base) {
    const [newId, baseId, version, at, priceFactor] = spec;
    const source = builtById.get(baseId);
    const src = source.quotation;
    const lineBase = 560 + versionIndex * 20;
    const optBase = 200 + versionIndex * 2;

    const chargeLines = source.chargeLines.map((line, li) => {
        const unit_price = roundNumber(Number(line.unit_price || 0) * priceFactor);
        const amount = roundNumber(Number(line.quantity || 0) * unit_price);
        return base({
            ...line,
            id: `qt_line_${String(lineBase + li).padStart(3, "0")}`,
            quotation_id: newId,
            unit_price,
            amount,
            tax_amount: 0,
            total_amount: amount,
            create_at: at,
            update_at: at
        });
    });

    const options = source.options.map((opt, oi) => base({
        ...opt,
        id: `qo-${String(optBase + oi).padStart(4, "0")}`,
        quotation_id: newId,
        headline_amount: Math.round(Number(opt.headline_amount || 0) * priceFactor),
        is_selected: false,
        create_at: at,
        update_at: at
    }));

    const totals = quotationTotals(chargeLines);

    return {
        quotation: base({
            ...src,
            id: newId,
            quotation_group_id: `qg_${baseId}`,
            quotation_no: `${src.quotation_no}-V${version}`,
            version,
            status: "REJECTED",
            is_final: false,
            confirmed_at: null,
            rejected_at: at,
            reject_reason: "KBI thấy giá còn cao, đề nghị FDS chào lại.",
            quoted_at: at,
            valid_until: addDays(at, 21),
            selected_option_id: null,
            note: `Revised after KBI rejection (version ${version}).`,
            ...totals,
            create_at: at,
            update_at: at
        }),
        options,
        chargeLines
    };
}

function buildOptions(quotationId, context, index, at, shouldSelect, base) {
    return [1, 2].map((optionNo) => {
        const carrier = optionNo === 1
            ? ["COSCO", "COSCO Shipping Lines", "COSCO STAR", "CS"]
            : ["EVERGREEN", "Evergreen Marine Corp", "EVER URBAN", "EGLV"];
        const isAir = context.mode === "AIR";
        const id = `qo-${String(100 + index * 2 + optionNo - 1).padStart(4, "0")}`;
        return base({
            id,
            quotation_id: quotationId,
            option_no: optionNo,
            carrier_code: carrier[0],
            carrier_name: carrier[1],
            mode: context.mode,
            vessel_or_flight: isAir ? (optionNo === 1 ? "VN Cargo 512" : "CX Cargo 764") : carrier[2],
            voyage_flight_no: isAir ? `${carrier[3]}${740 + index}` : `${carrier[3]}${1420 + index}S`,
            etd: addDays(at, 8 + optionNo * 2),
            eta: addDays(at, isAir ? 10 + optionNo : 16 + optionNo * 3),
            transit_time_days: isAir ? 2 + optionNo : 8 + optionNo * 2,
            risk_warning: optionNo === 2 ? "Limited free time at destination" : null,
            headline_amount: Math.round((isAir ? 2100 + index * 117 : 1450 + index * 132) * (optionNo === 1 ? 1 : 1.08)),
            is_recommended: optionNo === 1,
            is_selected: shouldSelect && optionNo === 1,
            create_at: at,
            update_at: at
        });
    });
}

function buildChargeLines(quotationId, context, index, at, base) {
    const isAir = context.mode === "AIR";
    const chargeable = isAir
        ? Math.max(context.gross_weight_kg || 300, Math.ceil((context.volume_cbm || 1) * 167))
        : Math.max(context.volume_cbm || 1, (context.gross_weight_kg || 1000) / 1000);
    const freightQty = isAir ? chargeable : context.mode === "SEA_FCL" ? 1 : Number(chargeable.toFixed(2));
    const freightUnit = isAir ? "KGS" : context.mode === "SEA_FCL" ? "CONT" : "RT";
    const freightPrice = isAir ? Number((3.8 + index * 0.08).toFixed(2)) : context.mode === "SEA_FCL" ? 1280 + index * 45 : Number((88 + index * 2.5).toFixed(2));
    const baseNo = 300 + index * 20;
    const localUnit = isAir ? "AWB" : "CONT";
    const v = (amount) => amount + index * 2;
    let seq = 0;
    const lines = [];
    const add = (line_no, patch) => {
        lines.push(chargeLine(base, at, `qt_line_${String(baseNo + seq).padStart(3, "0")}`, quotationId, line_no, patch));
        seq += 1;
    };

    // line_no 1..4 kept stable: ORIGIN base, DESTINATION base, FREIGHT opt1 base, FREIGHT opt2 base.
    // qt_027 negotiation adjustments reference line_no 3 & 4, so those must stay the freight-base lines.
    add(1, {
        charge_group: "ORIGIN",
        charge_type: isAir ? "ORIGIN_CHARGE" : "CFS",
        charge_code: isAir ? "OTH" : "OTL",
        description: isAir ? "Origin airport handling" : "Origin handling",
        quantity: isAir ? 1 : freightQty,
        unit: isAir ? "AWB" : freightUnit,
        unit_price: isAir ? 85 + index * 3 : 36 + index * 2
    });
    add(2, {
        charge_group: "DESTINATION",
        charge_type: isAir ? "DO_FEE" : "DOCUMENT_FEE",
        charge_code: isAir ? "DOF" : "DOC",
        description: isAir ? "Airline delivery order fee" : "Documentation fee",
        quantity: 1,
        unit: isAir ? "AWB" : "SET",
        unit_price: isAir ? 48 + index * 2 : 42 + index * 2
    });
    add(3, {
        charge_group: "FREIGHT",
        option_no: 1,
        charge_type: isAir ? "AIR_FREIGHT" : "OCEAN_FREIGHT",
        charge_code: isAir ? "AFR" : "OFR",
        description: isAir ? "Airport-to-airport freight" : "Port-to-port ocean freight",
        quantity: freightQty,
        unit: freightUnit,
        unit_price: freightPrice,
        note: isAir ? "Chargeable weight basis." : null
    });
    add(4, {
        charge_group: "FREIGHT",
        option_no: 2,
        charge_type: "OTHER",
        charge_code: isAir ? "FSC" : "BAF",
        description: isAir ? "Fuel surcharge alternate option" : "Bunker adjustment alternate option",
        quantity: freightQty,
        unit: freightUnit,
        unit_price: Number((freightPrice * 1.08).toFixed(2))
    });

    // Additional shared ORIGIN / DESTINATION local charges (option_no = null) so the
    // "Chi tiết phí" breakdown shows a full ~11-line set per option.
    add(5, { charge_group: "ORIGIN", charge_type: "ORIGIN_CHARGE", charge_code: "ORC", description: "Origin receiving charge", quantity: 1, unit: localUnit, unit_price: v(85) });
    add(6, { charge_group: "ORIGIN", charge_type: "HANDLING", charge_code: "ISPS", description: "Origin ISPS / security", quantity: 1, unit: "BL", unit_price: v(15) });
    add(7, { charge_group: "ORIGIN", charge_type: "DOCUMENT_FEE", charge_code: "AMS", description: "AMS / manifest filing", quantity: 1, unit: "BL", unit_price: v(30) });
    add(8, { charge_group: "DESTINATION", charge_type: "THC", charge_code: "DTH", description: "Destination THC", quantity: 1, unit: localUnit, unit_price: v(130) });
    add(9, { charge_group: "DESTINATION", charge_type: "CIC", charge_code: "CIC", description: "Container imbalance charge", quantity: 1, unit: localUnit, unit_price: v(55) });
    add(10, { charge_group: "DESTINATION", charge_type: "CLEANING", charge_code: "CLN", description: "Container cleaning", quantity: 1, unit: localUnit, unit_price: v(18) });
    add(11, { charge_group: "DESTINATION", charge_type: "HANDLING", charge_code: "HDL", description: "Destination handling", quantity: 1, unit: "SHPT", unit_price: v(40) });

    // Per-option freight surcharge so each option's FREIGHT group has 2 lines.
    add(12, { charge_group: "FREIGHT", option_no: 1, charge_type: "OTHER", charge_code: "LSS", description: "Low sulphur surcharge", quantity: freightQty, unit: freightUnit, unit_price: Number((freightPrice * 0.12).toFixed(2)) });
    add(13, { charge_group: "FREIGHT", option_no: 2, charge_type: "OTHER", charge_code: "PSS", description: "Peak season surcharge", quantity: freightQty, unit: freightUnit, unit_price: Number((freightPrice * 0.1).toFixed(2)) });

    return lines;
}

function chargeLine(base, at, id, quotation_id, line_no, patch) {
    const amount = roundNumber(patch.quantity * patch.unit_price);
    const taxRate = 0;
    const taxAmount = 0;
    return base({
        id,
        quotation_id,
        line_no,
        charge_group: patch.charge_group,
        option_no: patch.option_no ?? null,
        charge_type: patch.charge_type,
        charge_code: patch.charge_code,
        description: patch.description,
        quantity: patch.quantity,
        unit: patch.unit,
        unit_price: patch.unit_price,
        amount,
        currency_code: patch.currency_code || "USD",
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: amount,
        note: patch.note || null,
        create_at: at,
        update_at: at
    });
}

function buildAdjustments(chargeLines, base) {
    return chargeLines
        .filter((line) => line.quotation_id === "qt_027" && [3, 4].includes(line.line_no))
        .map((line, index) => base({
            id: `qt_adj_${String(index + 1).padStart(3, "0")}`,
            quotation_id: "qt_027",
            charge_line_id: line.id,
            round_no: 1,
            actor_role: "KBI",
            base_unit_price: line.unit_price,
            proposed_unit_price: Number((line.unit_price * (index === 0 ? 0.94 : 0.96)).toFixed(2)),
            currency_code: line.currency_code,
            note: index === 0 ? "KBI requested sharper base freight." : "KBI asked to reduce surcharge.",
            status: "PROPOSED",
            create_at: "2026-06-28T13:10:00+07:00",
            update_at: "2026-06-28T13:10:00+07:00"
        }));
}

function buildQuotationEvents(quotation, index, base) {
    if (quotation.status === "DRAFT") return [];
    const eventCodeByStatus = {
        PENDING_APPROVAL: "SUBMIT_TO_KBI",
        PENDING_ADJUSTMENT: "NEGOTIATE",
        REJECTED: "REJECT",
        CONFIRMED: "MARK_FINAL"
    };
    return [base({
        id: `qt_event_${String(20 + index).padStart(3, "0")}`,
        quotation_id: quotation.id,
        event_code: eventCodeByStatus[quotation.status] || quotation.status,
        event_at: quotation.quoted_at || quotation.create_at,
        note: `Quotation moved to ${quotation.status} in seeded RFQ flow.`
    })];
}

function quotationTotals(lines) {
    // Total reflects the recommended option (option 1): shared lines + option-1 freight,
    // not both options' freight summed together.
    const priced = lines.filter((line) => line.option_no == null || line.option_no === 1);
    const total_amount = roundNumber(priced.reduce((sum, line) => sum + Number(line.amount || 0), 0));
    const total_tax_amount = roundNumber(priced.reduce((sum, line) => sum + Number(line.tax_amount || 0), 0));
    return {
        total_amount,
        total_tax_amount,
        grand_total_amount: roundNumber(total_amount + total_tax_amount)
    };
}

function addDays(value, days) {
    const date = new Date(`${value.slice(0, 10)}T00:00:00.000+07:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
}

function roundNumber(value) {
    return Number(Number(value || 0).toFixed(2));
}

function rfqNote(status) {
    if (status === "SUBMITTED") return "Awaiting FDS pickup.";
    if (status === "RECEIVED") return "FDS is processing the responding quotation.";
    if (status === "QUOTED") return "Quotation is ready for KBI review.";
    if (status === "CONFIRMED") return "KBI confirmed the linked quotation.";
    return "Closed by KBI before quotation follow-up.";
}

function quotationNote(status, rfqId) {
    const statusForRfq = RFQ_STATUSES_FROM_QUOTATION[status];
    if (!rfqId) return "Standalone market-rate request before a formal RFQ is linked.";
    return `Linked to ${rfqId}; RFQ status resolves to ${statusForRfq}.`;
}
