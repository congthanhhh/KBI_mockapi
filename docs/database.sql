CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS item_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    group_code VARCHAR(50) UNIQUE,
    group_name VARCHAR(255) NOT NULL,
    description TEXT,

    create_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delete_at TIMESTAMPTZ,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS item_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,

    item_group_id UUID REFERENCES item_groups(id),

    unit VARCHAR(50),
    item_type VARCHAR(50), 
    origin_country VARCHAR(100),

    lead_time_days INT DEFAULT 0,
    moq NUMERIC(18,4) DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    create_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delete_at TIMESTAMPTZ,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS item_customs_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    item_id UUID NOT NULL REFERENCES item_master(id),

    hs_code VARCHAR(20),
    import_duty_rate NUMERIC(5,2),
    vat_rate NUMERIC(5,2),

    co_form VARCHAR(50),
    co_tax_note TEXT,

    customs_type VARCHAR(50),
    customs_note TEXT,

    is_default BOOLEAN NOT NULL DEFAULT TRUE,

    create_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delete_at TIMESTAMPTZ,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE
);
