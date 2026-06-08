CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    item_code VARCHAR(50),
    item_group_name TEXT,

    item_name_vi TEXT,
    item_name_en TEXT,
    model VARCHAR(100),

    description TEXT NOT NULL,
    normalized_description TEXT,

    default_hs_code VARCHAR(20),
    classification_code VARCHAR(50),

    note TEXT,

    create_at TIMESTAMP DEFAULT now(),
    update_at TIMESTAMP DEFAULT now(),
    is_delete BOOLEAN DEFAULT false,
    delete_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    item_id UUID NOT NULL REFERENCES master_items(id),

    hs_code VARCHAR(20),
    import_tax_rate NUMERIC(5,2),
    vat_rate NUMERIC(5,2),

    tariff_code VARCHAR(50),
    classification_code VARCHAR(50),

    co_note TEXT,
    preferential_tax_rate NUMERIC(5,2),

    tax_note TEXT,

    create_at TIMESTAMP DEFAULT now(),
    update_at TIMESTAMP DEFAULT now(),
    is_delete BOOLEAN DEFAULT false,
    delete_at TIMESTAMP
);
