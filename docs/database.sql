CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. ITEM GROUPS
-- =========================================================

CREATE TABLE IF NOT EXISTS item_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    group_code VARCHAR(50) UNIQUE,
    group_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- HS code cấp group/header trong Excel
    -- Ví dụ: Động cơ dầu SDEC 4Z2.3-G21 -> 850440
    default_hs_code VARCHAR(20),

    create_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delete_at TIMESTAMPTZ,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE
);

-- =========================================================
-- 2. ITEM MASTER
-- =========================================================

CREATE TABLE IF NOT EXISTS item_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,

    item_group_id UUID REFERENCES item_groups(id),

    unit VARCHAR(50),
    item_type VARCHAR(50),
    origin_country VARCHAR(100),

    -- Lấy từ mô tả hàng hóa nếu có
    -- Ví dụ: EVSENT, SDEC...
    brand VARCHAR(100),

    -- Model/mã kỹ thuật lấy từ mô tả hàng
    -- Ví dụ: CKK744-1.6-21K, D1105/V1505
    model VARCHAR(100),

    -- Excel có nhiều dòng "hàng mới 100%"
    is_new BOOLEAN NOT NULL DEFAULT TRUE,

    lead_time_days INT DEFAULT 0,
    moq NUMERIC(18,4) DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    create_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delete_at TIMESTAMPTZ,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE
);

-- =========================================================
-- 3. ITEM CUSTOMS PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS item_customs_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    item_id UUID NOT NULL REFERENCES item_master(id),

    -- HS code cấp item/detail
    -- Ví dụ: 85030090, 85369099, 85389011
    hs_code VARCHAR(20),

    import_duty_rate NUMERIC(5,2),
    vat_rate NUMERIC(5,2),

    -- CO form / ưu đãi thuế
    -- Ví dụ: FORM E
    co_form VARCHAR(50),
    co_tax_note TEXT,

    -- Loại hình hải quan
    -- Ví dụ: A12
    customs_type VARCHAR(50),
    customs_note TEXT,

    -- Số văn bản / tham chiếu
    -- Ví dụ: VB245
    reference_doc_no VARCHAR(100),

    -- Vị trí / mã kho / mã nội bộ trong Excel
    -- Ví dụ: B05
    location_code VARCHAR(50),

    -- Ghi chú thuế
    -- Ví dụ: Thuế suất: C
    tax_note TEXT,

    -- Thuế NK ưu đãi theo CO
    -- Ví dụ: CO FORM E = 0% -> 0.00
    preferential_import_duty_rate NUMERIC(5,2),

    is_default BOOLEAN NOT NULL DEFAULT TRUE,

    create_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delete_at TIMESTAMPTZ,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE
);