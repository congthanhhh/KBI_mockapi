CREATE TABLE IF NOT EXISTS import_tax_lines (
    id TEXT PRIMARY KEY,
    ten_hang TEXT,
    so_tham_chieu TEXT,
    loai_hinh TEXT,
    mo_ta TEXT,
    ma_hs TEXT,
    thue_nk TEXT,
    thue_gtgt TEXT,
    ma_vb TEXT,
    ma_b TEXT,
    ghi_chu TEXT,
    ghi_chu_khac TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS import_tax_lines_search_idx
ON import_tax_lines
USING gin (
    to_tsvector(
        'simple',
        concat_ws(' ', ten_hang, so_tham_chieu, loai_hinh, mo_ta, ma_hs, ma_vb, ma_b, ghi_chu, ghi_chu_khac)
    )
);
