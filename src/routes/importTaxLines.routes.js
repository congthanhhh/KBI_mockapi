import express from "express";
import { query } from "../db/pool.js";

const router = express.Router();

const selectColumns = `
    id,
    ten_hang AS "Ten_Hang",
    so_tham_chieu AS "So_Tham_Chieu",
    loai_hinh AS "Loai_Hinh",
    mo_ta AS "Mo_Ta",
    ma_hs AS "Ma_HS",
    thue_nk AS "Thue_NK",
    thue_gtgt AS "Thue_GTGT",
    ma_vb AS "Ma_VB",
    ma_b AS "Ma_B",
    ghi_chu AS "Ghi_Chu",
    ghi_chu_khac AS "Ghi_Chu_Khac"
`;

const requestToDbColumns = {
    Ten_Hang: "ten_hang",
    So_Tham_Chieu: "so_tham_chieu",
    Loai_Hinh: "loai_hinh",
    Mo_Ta: "mo_ta",
    Ma_HS: "ma_hs",
    Thue_NK: "thue_nk",
    Thue_GTGT: "thue_gtgt",
    Ma_VB: "ma_vb",
    Ma_B: "ma_b",
    Ghi_Chu: "ghi_chu",
    Ghi_Chu_Khac: "ghi_chu_khac"
};

router.get("/", async (req, res) => {
    const { q, hsCode, transportOrImportType } = req.query;

    const filters = [];
    const values = [];

    if (q) {
        values.push(`%${q}%`);
        filters.push(`
            concat_ws(' ', ten_hang, so_tham_chieu, loai_hinh, mo_ta, ma_hs, ma_vb, ma_b, ghi_chu, ghi_chu_khac)
            ILIKE $${values.length}
        `);
    }

    if (hsCode) {
        values.push(hsCode);
        filters.push(`ma_hs = $${values.length}`);
    }

    if (transportOrImportType) {
        values.push(transportOrImportType);
        filters.push(`loai_hinh = $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    try {
        const [itemsResult, countResult] = await Promise.all([
            query(
                `SELECT ${selectColumns}
                 FROM import_tax_lines
                 ${whereClause}
                 ORDER BY id`,
                values
            ),
            query(
                `SELECT COUNT(*)::int AS total
                 FROM import_tax_lines
                 ${whereClause}`,
                values
            )
        ]);

        res.json({
            data: itemsResult.rows,
            total: countResult.rows[0].total
        });
    } catch (error) {
        res.status(500).json({
            message: "Cannot get import tax lines",
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            `SELECT ${selectColumns}
             FROM import_tax_lines
             WHERE id = $1`,
            [id]
        );

        if (!result.rowCount) {
            return res.status(404).json({
                message: "Import tax line not found"
            });
        }

        res.json({
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: "Cannot get import tax line",
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    const fields = Object.entries(requestToDbColumns)
        .filter(([requestKey]) => Object.hasOwn(req.body, requestKey));

    const columns = ["id", ...fields.map(([, dbColumn]) => dbColumn)];
    const values = [
        req.body.id || `ITX-${Date.now()}`,
        ...fields.map(([requestKey]) => req.body[requestKey])
    ];
    const placeholders = values.map((_, index) => `$${index + 1}`);

    try {
        const result = await query(
            `INSERT INTO import_tax_lines (${columns.join(", ")})
             VALUES (${placeholders.join(", ")})
             RETURNING ${selectColumns}`,
            values
        );

        res.status(201).json({
            data: result.rows[0],
            message: "Created successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Cannot create import tax line",
            error: error.message
        });
    }
});

export default router;
