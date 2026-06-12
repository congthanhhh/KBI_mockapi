--
-- PostgreSQL database dump
--

\restrict ZLu7aDKePCZYNbTvcELnNYtmEuZsOrcVYIhUM6FTbEyfojSGH5W8A0ZXaGNuHje

-- Dumped from database version 18.4 (6e15e70)
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-12 10:29:03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 58822)
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- TOC entry 271 (class 1255 OID 59639)
-- Name: fn_after_po_confirmation_line_change(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_after_po_confirmation_line_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM fn_refresh_po_line_qty_confirmed(OLD.purchase_order_line_id);
        RETURN OLD;
    END IF;

    PERFORM fn_refresh_po_line_qty_confirmed(NEW.purchase_order_line_id);

    IF TG_OP = 'UPDATE'
       AND OLD.purchase_order_line_id IS DISTINCT FROM NEW.purchase_order_line_id THEN
        PERFORM fn_refresh_po_line_qty_confirmed(OLD.purchase_order_line_id);
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_after_po_confirmation_line_change() OWNER TO neondb_owner;

--
-- TOC entry 275 (class 1255 OID 59646)
-- Name: fn_after_po_lot_line_change(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_after_po_lot_line_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM fn_refresh_po_line_qty_lotted(OLD.purchase_order_line_id);
        RETURN OLD;
    END IF;

    PERFORM fn_refresh_po_line_qty_lotted(NEW.purchase_order_line_id);

    IF TG_OP = 'UPDATE'
       AND OLD.purchase_order_line_id IS DISTINCT FROM NEW.purchase_order_line_id THEN
        PERFORM fn_refresh_po_line_qty_lotted(OLD.purchase_order_line_id);
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_after_po_lot_line_change() OWNER TO neondb_owner;

--
-- TOC entry 283 (class 1255 OID 59796)
-- Name: fn_after_quotation_change(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_after_quotation_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM fn_log_quotation_event(
            NEW.id,
            'CREATED',
            NULL,
            NEW.status,
            NULL,
            'Quotation created',
            NULL
        );

        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE'
       AND OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM fn_log_quotation_event(
            NEW.id,
            'STATUS_CHANGED',
            OLD.status,
            NEW.status,
            NULL,
            'Quotation status changed',
            NULL
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_after_quotation_change() OWNER TO neondb_owner;

--
-- TOC entry 286 (class 1255 OID 59801)
-- Name: fn_after_quotation_charge_line_change(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_after_quotation_charge_line_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_quotation_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_quotation_id := OLD.quotation_id;
    ELSE
        v_quotation_id := NEW.quotation_id;
    END IF;

    PERFORM fn_refresh_quotation_totals(v_quotation_id);

    PERFORM fn_log_quotation_event(
        v_quotation_id,
        'CHARGE_LINE_CHANGED',
        NULL,
        NULL,
        NULL,
        'Quotation charge line changed',
        NULL
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_after_quotation_charge_line_change() OWNER TO neondb_owner;

--
-- TOC entry 291 (class 1255 OID 73913)
-- Name: fn_after_shipment_created(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_after_shipment_created() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM fn_init_shipment_milestones(NEW.id);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_after_shipment_created() OWNER TO neondb_owner;

--
-- TOC entry 294 (class 1255 OID 73917)
-- Name: fn_after_shipment_line_change(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_after_shipment_line_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM fn_refresh_po_line_qty_shipped(OLD.purchase_order_line_id);
        RETURN OLD;
    END IF;

    PERFORM fn_refresh_po_line_qty_shipped(NEW.purchase_order_line_id);

    IF TG_OP = 'UPDATE'
       AND OLD.purchase_order_line_id IS DISTINCT FROM NEW.purchase_order_line_id THEN
        PERFORM fn_refresh_po_line_qty_shipped(OLD.purchase_order_line_id);
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_after_shipment_line_change() OWNER TO neondb_owner;

--
-- TOC entry 284 (class 1255 OID 59798)
-- Name: fn_before_quotation_charge_line_change(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_before_quotation_charge_line_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_quotation_status TEXT;
BEGIN
    SELECT status::TEXT
    INTO v_quotation_status
    FROM quotations
    WHERE id = NEW.quotation_id
      AND is_delete = FALSE;

    IF v_quotation_status IS NULL THEN
        RAISE EXCEPTION 'Quotation not found';
    END IF;

    IF v_quotation_status IN (
        'SUBMITTED_TO_KBI',
        'CONFIRMED_BY_KBI',
        'REJECTED',
        'CANCELLED',
        'EXPIRED'
    ) THEN
        RAISE EXCEPTION 'Cannot change charge lines when quotation status is %', v_quotation_status;
    END IF;

    NEW.amount := ROUND((NEW.quantity * NEW.unit_price)::NUMERIC, 4);
    NEW.tax_amount := ROUND((NEW.amount * NEW.tax_rate / 100)::NUMERIC, 4);
    NEW.total_amount := NEW.amount + NEW.tax_amount;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_before_quotation_charge_line_change() OWNER TO neondb_owner;

--
-- TOC entry 302 (class 1255 OID 82037)
-- Name: fn_clear_customs_declaration(uuid, timestamp with time zone, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_clear_customs_declaration(p_customs_declaration_id uuid, p_cleared_at timestamp with time zone DEFAULT now(), p_note text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_shipment_id UUID;
    v_line_count INT;
BEGIN
    SELECT shipment_id
    INTO v_shipment_id
    FROM customs_declarations
    WHERE id = p_customs_declaration_id
      AND is_delete = FALSE
      AND status NOT IN ('CLEARED', 'CANCELLED');

    IF v_shipment_id IS NULL THEN
        RAISE EXCEPTION 'Customs declaration not found or already locked';
    END IF;

    SELECT COUNT(*)
    INTO v_line_count
    FROM customs_declaration_lines
    WHERE customs_declaration_id = p_customs_declaration_id
      AND is_delete = FALSE;

    IF v_line_count = 0 THEN
        RAISE EXCEPTION 'Cannot clear customs declaration without lines';
    END IF;

    UPDATE customs_declarations
    SET
        status = 'CLEARED',
        cleared_at = COALESCE(cleared_at, p_cleared_at),
        note = COALESCE(p_note, note),
        update_at = NOW()
    WHERE id = p_customs_declaration_id;

    UPDATE shipments
    SET
        status = 'CUSTOMS_CLEARED',
        update_at = NOW()
    WHERE id = v_shipment_id
      AND is_delete = FALSE
      AND status <> 'CANCELLED';

    UPDATE shipment_milestones
    SET
        status = 'DONE',
        actual_at = COALESCE(actual_at, p_cleared_at),
        notes = COALESCE(p_note, notes),
        update_at = NOW()
    WHERE shipment_id = v_shipment_id
      AND milestone_code = 'CUSTOMS_CLEARED'
      AND is_delete = FALSE;
END;
$$;


ALTER FUNCTION public.fn_clear_customs_declaration(p_customs_declaration_id uuid, p_cleared_at timestamp with time zone, p_note text) OWNER TO neondb_owner;

--
-- TOC entry 299 (class 1255 OID 82033)
-- Name: fn_create_customs_declaration_from_shipment(uuid, character varying, character varying, character varying, uuid, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_create_customs_declaration_from_shipment(p_shipment_id uuid, p_declaration_no character varying DEFAULT NULL::character varying, p_customs_type character varying DEFAULT 'IMPORT'::character varying, p_customs_channel character varying DEFAULT NULL::character varying, p_broker_id uuid DEFAULT NULL::uuid, p_note text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_customs_declaration_id UUID;
    v_currency_id UUID;
    r_line RECORD;
BEGIN
    SELECT po.currency_id
    INTO v_currency_id
    FROM shipments s
    JOIN purchase_orders po
        ON po.id = s.purchase_order_id
    WHERE s.id = p_shipment_id
      AND s.is_delete = FALSE
      AND po.is_delete = FALSE;

    IF v_currency_id IS NULL THEN
        RAISE EXCEPTION 'Shipment or purchase order currency not found';
    END IF;

    INSERT INTO customs_declarations (
        shipment_id,
        declaration_no,
        customs_type,
        customs_channel,
        broker_id,
        status,
        note
    )
    VALUES (
        p_shipment_id,
        p_declaration_no,
        COALESCE(p_customs_type, 'IMPORT'),
        p_customs_channel,
        p_broker_id,
        'DRAFT',
        p_note
    )
    RETURNING id INTO v_customs_declaration_id;

    FOR r_line IN
        SELECT
            ROW_NUMBER() OVER (ORDER BY sl.create_at, sl.id) AS line_no,
            sl.id AS shipment_line_id,
            sl.purchase_order_line_id,
            sl.item_id,
            COALESCE(sl.item_description, pol.item_description, im.item_description) AS item_description,
            sl.qty_shipped AS quantity,
            sl.unit,
            COALESCE(pol.unit_price, 0) AS unit_price,
            icp.id AS item_customs_profile_id,
            icp.hs_code,
            icp.import_duty_rate,
            icp.preferential_import_duty_rate,
            icp.vat_rate,
            icp.co_form
        FROM shipment_lines sl
        JOIN purchase_order_lines pol
            ON pol.id = sl.purchase_order_line_id
        JOIN item_master im
            ON im.id = sl.item_id
        LEFT JOIN LATERAL (
            SELECT icp2.*
            FROM item_customs_profiles icp2
            WHERE icp2.item_id = sl.item_id
              AND icp2.is_delete = FALSE
            ORDER BY
                CASE WHEN icp2.id = pol.item_customs_profile_id THEN 0 ELSE 1 END,
                icp2.is_default DESC
            LIMIT 1
        ) icp ON TRUE
        WHERE sl.shipment_id = p_shipment_id
          AND sl.is_delete = FALSE
          AND pol.is_delete = FALSE
    LOOP
        INSERT INTO customs_declaration_lines (
            customs_declaration_id,
            shipment_line_id,
            purchase_order_line_id,
            item_id,
            item_customs_profile_id,
            line_no,
            hs_code,
            item_description,
            quantity,
            unit,
            customs_value,
            currency_id,
            import_duty_rate,
            preferential_tax_rate,
            vat_rate,
            co_form
        )
        VALUES (
            v_customs_declaration_id,
            r_line.shipment_line_id,
            r_line.purchase_order_line_id,
            r_line.item_id,
            r_line.item_customs_profile_id,
            r_line.line_no,
            r_line.hs_code,
            r_line.item_description,
            r_line.quantity,
            r_line.unit,
            ROUND((r_line.quantity * r_line.unit_price)::NUMERIC, 4),
            v_currency_id,
            COALESCE(r_line.import_duty_rate, 0),
            r_line.preferential_import_duty_rate,
            COALESCE(r_line.vat_rate, 0),
            r_line.co_form
        );
    END LOOP;

    UPDATE shipments
    SET
        status = CASE
            WHEN status IN ('BOOKING_PENDING', 'BOOKING_CONFIRMED', 'CARGO_READY', 'PICKED_UP', 'BL_ISSUED', 'GATE_IN_POL', 'IN_TRANSIT', 'ARRIVED')
            THEN 'CUSTOMS_DRAFT'
            ELSE status
        END,
        update_at = NOW()
    WHERE id = p_shipment_id
      AND is_delete = FALSE
      AND status <> 'CANCELLED';

    UPDATE shipment_milestones
    SET
        status = 'DONE',
        actual_at = COALESCE(actual_at, NOW()),
        update_at = NOW()
    WHERE shipment_id = p_shipment_id
      AND milestone_code = 'CUSTOMS_DRAFT'
      AND is_delete = FALSE;

    RETURN v_customs_declaration_id;
END;
$$;


ALTER FUNCTION public.fn_create_customs_declaration_from_shipment(p_shipment_id uuid, p_declaration_no character varying, p_customs_type character varying, p_customs_channel character varying, p_broker_id uuid, p_note text) OWNER TO neondb_owner;

--
-- TOC entry 280 (class 1255 OID 59656)
-- Name: fn_create_delivery_order_from_lots(character varying, uuid, uuid[], uuid, date, date, date, text, text, character varying, character varying, character varying, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_create_delivery_order_from_lots(p_do_no character varying, p_purchase_order_id uuid, p_lot_ids uuid[], p_transport_mode_id uuid DEFAULT NULL::uuid, p_planned_cargo_ready_date date DEFAULT NULL::date, p_planned_etd date DEFAULT NULL::date, p_planned_eta date DEFAULT NULL::date, p_origin_address text DEFAULT NULL::text, p_destination_address text DEFAULT NULL::text, p_warehouse_name character varying DEFAULT NULL::character varying, p_requested_by character varying DEFAULT NULL::character varying, p_handled_by character varying DEFAULT NULL::character varying, p_notes text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_delivery_order_id UUID;
    v_delivery_order_lot_id UUID;
    v_lot_id UUID;
    r_lot RECORD;
    r_line RECORD;
BEGIN
    IF p_lot_ids IS NULL OR array_length(p_lot_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'p_lot_ids is required';
    END IF;

    INSERT INTO delivery_orders (
        do_no,
        purchase_order_id,
        transport_mode_id,
        planned_cargo_ready_date,
        planned_etd,
        planned_eta,
        origin_address,
        destination_address,
        warehouse_name,
        requested_by,
        handled_by,
        notes
    ) VALUES (
        p_do_no,
        p_purchase_order_id,
        p_transport_mode_id,
        p_planned_cargo_ready_date,
        p_planned_etd,
        p_planned_eta,
        p_origin_address,
        p_destination_address,
        p_warehouse_name,
        p_requested_by,
        p_handled_by,
        p_notes
    ) RETURNING id INTO v_delivery_order_id;

    FOREACH v_lot_id IN ARRAY p_lot_ids
    LOOP
        SELECT id, lot_no, lot_name, planned_cargo_ready_date, planned_etd, planned_eta
        INTO r_lot
        FROM po_lots
        WHERE id = v_lot_id
          AND purchase_order_id = p_purchase_order_id
          AND is_delete = FALSE;

        IF r_lot.id IS NULL THEN
            RAISE EXCEPTION 'Invalid lot_id % for PO %', v_lot_id, p_purchase_order_id;
        END IF;

        INSERT INTO delivery_order_lots (
            delivery_order_id,
            po_lot_id,
            lot_no,
            lot_name,
            planned_cargo_ready_date,
            planned_etd,
            planned_eta
        ) VALUES (
            v_delivery_order_id,
            r_lot.id,
            r_lot.lot_no,
            r_lot.lot_name,
            r_lot.planned_cargo_ready_date,
            r_lot.planned_etd,
            r_lot.planned_eta
        ) RETURNING id INTO v_delivery_order_lot_id;

        FOR r_line IN
            SELECT
                pll.purchase_order_line_id,
                pll.item_id,
                pol.item_description,
                pll.qty_lotted,
                pll.unit
            FROM po_lot_lines pll
            JOIN purchase_order_lines pol
                ON pol.id = pll.purchase_order_line_id
            WHERE pll.po_lot_id = r_lot.id
              AND pll.is_delete = FALSE
              AND pol.is_delete = FALSE
        LOOP
            INSERT INTO delivery_order_lines (
                delivery_order_id,
                delivery_order_lot_id,
                purchase_order_line_id,
                item_id,
                item_description,
                qty,
                unit
            ) VALUES (
                v_delivery_order_id,
                v_delivery_order_lot_id,
                r_line.purchase_order_line_id,
                r_line.item_id,
                r_line.item_description,
                r_line.qty_lotted,
                r_line.unit
            );
        END LOOP;
    END LOOP;

    RETURN v_delivery_order_id;
END;
$$;


ALTER FUNCTION public.fn_create_delivery_order_from_lots(p_do_no character varying, p_purchase_order_id uuid, p_lot_ids uuid[], p_transport_mode_id uuid, p_planned_cargo_ready_date date, p_planned_etd date, p_planned_eta date, p_origin_address text, p_destination_address text, p_warehouse_name character varying, p_requested_by character varying, p_handled_by character varying, p_notes text) OWNER TO neondb_owner;

--
-- TOC entry 287 (class 1255 OID 59803)
-- Name: fn_create_quotation_version(uuid, character varying, character varying, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_create_quotation_version(p_source_quotation_id uuid, p_new_quotation_no character varying DEFAULT NULL::character varying, p_actor_name character varying DEFAULT NULL::character varying, p_note text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_source quotations%ROWTYPE;
    v_new_id UUID;
    v_new_version INT;
BEGIN
    SELECT *
    INTO v_source
    FROM quotations
    WHERE id = p_source_quotation_id
      AND is_delete = FALSE
    FOR UPDATE;

    IF v_source.id IS NULL THEN
        RAISE EXCEPTION 'Source quotation not found';
    END IF;

    SELECT COALESCE(MAX(version), 0) + 1
    INTO v_new_version
    FROM quotations
    WHERE quotation_group_id = v_source.quotation_group_id
      AND is_delete = FALSE;

    -- Khi tạo version mới, không còn bản final hiện tại.
    UPDATE quotations
    SET
        is_final = FALSE,
        update_at = NOW()
    WHERE quotation_group_id = v_source.quotation_group_id
      AND is_delete = FALSE;

    INSERT INTO quotations (
        quotation_group_id,
        quotation_no,
        version,
        ref_type,
        ref_id,
        supplier_id,
        quotation_type,
        currency_id,
        exchange_rate,
        status,
        is_final,
        quoted_at,
        valid_until,
        note
    )
    VALUES (
        v_source.quotation_group_id,
        COALESCE(p_new_quotation_no, v_source.quotation_no),
        v_new_version,
        v_source.ref_type,
        v_source.ref_id,
        v_source.supplier_id,
        v_source.quotation_type,
        v_source.currency_id,
        v_source.exchange_rate,
        'DRAFT',
        FALSE,
        NULL,
        v_source.valid_until,
        COALESCE(p_note, 'Created from previous quotation version')
    )
    RETURNING id INTO v_new_id;

    INSERT INTO quotation_charge_lines (
        quotation_id,
        line_no,
        charge_type,
        description,
        quantity,
        unit,
        unit_price,
        tax_rate,
        note
    )
    SELECT
        v_new_id,
        line_no,
        charge_type,
        description,
        quantity,
        unit,
        unit_price,
        tax_rate,
        note
    FROM quotation_charge_lines
    WHERE quotation_id = p_source_quotation_id
      AND is_delete = FALSE
    ORDER BY line_no;

    PERFORM fn_refresh_quotation_totals(v_new_id);

    PERFORM fn_log_quotation_event(
        p_source_quotation_id,
        'VERSION_CREATED',
        v_source.status,
        v_source.status,
        p_actor_name,
        'New quotation version created from this quotation',
        jsonb_build_object('new_quotation_id', v_new_id, 'new_version', v_new_version)
    );

    PERFORM fn_log_quotation_event(
        v_new_id,
        'VERSION_CREATED',
        NULL,
        'DRAFT',
        p_actor_name,
        'Quotation version created',
        jsonb_build_object('source_quotation_id', p_source_quotation_id, 'version', v_new_version)
    );

    RETURN v_new_id;
END;
$$;


ALTER FUNCTION public.fn_create_quotation_version(p_source_quotation_id uuid, p_new_quotation_no character varying, p_actor_name character varying, p_note text) OWNER TO neondb_owner;

--
-- TOC entry 295 (class 1255 OID 73920)
-- Name: fn_create_shipment_from_delivery_order(character varying, uuid, uuid, uuid, uuid, character varying, character varying, character varying, character varying, character varying, jsonb, character varying, character varying, date, date, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_create_shipment_from_delivery_order(p_shipment_no character varying, p_delivery_order_id uuid, p_final_quotation_id uuid DEFAULT NULL::uuid, p_transport_mode_id uuid DEFAULT NULL::uuid, p_forwarder_id uuid DEFAULT NULL::uuid, p_carrier character varying DEFAULT NULL::character varying, p_mode character varying DEFAULT 'SEA'::character varying, p_vessel_flight character varying DEFAULT NULL::character varying, p_voyage_no character varying DEFAULT NULL::character varying, p_bl_awb_no character varying DEFAULT NULL::character varying, p_container_no jsonb DEFAULT NULL::jsonb, p_pol character varying DEFAULT NULL::character varying, p_pod character varying DEFAULT NULL::character varying, p_etd date DEFAULT NULL::date, p_eta date DEFAULT NULL::date, p_notes text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_shipment_id UUID;
    v_purchase_order_id UUID;
    r_line RECORD;
BEGIN
    SELECT purchase_order_id
    INTO v_purchase_order_id
    FROM delivery_orders
    WHERE id = p_delivery_order_id
      AND is_delete = FALSE;

    IF v_purchase_order_id IS NULL THEN
        RAISE EXCEPTION 'Delivery order not found';
    END IF;

    INSERT INTO shipments (
        shipment_no,
        delivery_order_id,
        purchase_order_id,
        final_quotation_id,
        transport_mode_id,
        forwarder_id,
        carrier,
        mode,
        vessel_flight,
        voyage_no,
        bl_awb_no,
        container_no,
        pol,
        pod,
        etd,
        eta,
        notes
    )
    VALUES (
        p_shipment_no,
        p_delivery_order_id,
        v_purchase_order_id,
        p_final_quotation_id,
        p_transport_mode_id,
        p_forwarder_id,
        p_carrier,
        p_mode,
        p_vessel_flight,
        p_voyage_no,
        p_bl_awb_no,
        p_container_no,
        p_pol,
        p_pod,
        p_etd,
        p_eta,
        p_notes
    )
    RETURNING id INTO v_shipment_id;

    FOR r_line IN
        SELECT
            doline.id AS delivery_order_line_id,
            doline.delivery_order_lot_id,
            doline.purchase_order_line_id,
            dol.po_lot_id,
            dol.lot_no,
            doline.item_id,
            doline.item_description,
            doline.qty,
            doline.unit
        FROM delivery_order_lines doline
        JOIN delivery_order_lots dol
            ON dol.id = doline.delivery_order_lot_id
        WHERE doline.delivery_order_id = p_delivery_order_id
          AND doline.is_delete = FALSE
          AND dol.is_delete = FALSE
    LOOP
        INSERT INTO shipment_lines (
            shipment_id,
            delivery_order_line_id,
            delivery_order_lot_id,
            purchase_order_line_id,
            po_lot_id,
            item_id,
            item_description,
            qty_shipped,
            unit,
            lot_no
        )
        VALUES (
            v_shipment_id,
            r_line.delivery_order_line_id,
            r_line.delivery_order_lot_id,
            r_line.purchase_order_line_id,
            r_line.po_lot_id,
            r_line.item_id,
            r_line.item_description,
            r_line.qty,
            r_line.unit,
            r_line.lot_no
        );
    END LOOP;

    UPDATE delivery_orders
    SET
        status = 'ASSIGNED_TO_SHIPMENT',
        update_at = NOW()
    WHERE id = p_delivery_order_id
      AND is_delete = FALSE;

    RETURN v_shipment_id;
END;
$$;


ALTER FUNCTION public.fn_create_shipment_from_delivery_order(p_shipment_no character varying, p_delivery_order_id uuid, p_final_quotation_id uuid, p_transport_mode_id uuid, p_forwarder_id uuid, p_carrier character varying, p_mode character varying, p_vessel_flight character varying, p_voyage_no character varying, p_bl_awb_no character varying, p_container_no jsonb, p_pol character varying, p_pod character varying, p_etd date, p_eta date, p_notes text) OWNER TO neondb_owner;

--
-- TOC entry 276 (class 1255 OID 59649)
-- Name: fn_init_default_po_slot_lot(uuid); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_init_default_po_slot_lot(p_purchase_order_id uuid) RETURNS TABLE(delivery_slot_id uuid, lot_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_po_id UUID;
    v_slot_id UUID;
    v_lot_id UUID;
    r_line RECORD;
BEGIN
    SELECT id
    INTO v_po_id
    FROM purchase_orders
    WHERE id = p_purchase_order_id
      AND is_delete = FALSE
    FOR UPDATE;

    IF v_po_id IS NULL THEN
        RAISE EXCEPTION 'Purchase order not found';
    END IF;

    SELECT id
    INTO v_slot_id
    FROM po_delivery_slots
    WHERE purchase_order_id = p_purchase_order_id
      AND slot_no = 'SLOT-001'
      AND is_delete = FALSE
    LIMIT 1;

    IF v_slot_id IS NULL THEN
        INSERT INTO po_delivery_slots (
            purchase_order_id,
            slot_no,
            slot_name,
            status,
            sort_order
        ) VALUES (
            p_purchase_order_id,
            'SLOT-001',
            'Default Slot',
            'PLANNED',
            1
        ) RETURNING id INTO v_slot_id;
    END IF;

    SELECT id
    INTO v_lot_id
    FROM po_lots
    WHERE purchase_order_id = p_purchase_order_id
      AND lot_no = 'LOT-001'
      AND is_delete = FALSE
    LIMIT 1;

    IF v_lot_id IS NULL THEN
        INSERT INTO po_lots (
            purchase_order_id,
            delivery_slot_id,
            lot_no,
            lot_name,
            status,
            sort_order
        ) VALUES (
            p_purchase_order_id,
            v_slot_id,
            'LOT-001',
            'Default Lot',
            'PLANNED',
            1
        ) RETURNING id INTO v_lot_id;
    END IF;

    FOR r_line IN
        SELECT id, item_id, qty_ordered, unit
        FROM purchase_order_lines
        WHERE purchase_order_id = p_purchase_order_id
          AND is_delete = FALSE
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM po_lot_lines
            WHERE po_lot_id = v_lot_id
              AND purchase_order_line_id = r_line.id
              AND is_delete = FALSE
        ) THEN
            INSERT INTO po_lot_lines (
                po_lot_id,
                purchase_order_line_id,
                item_id,
                qty_lotted,
                unit
            ) VALUES (
                v_lot_id,
                r_line.id,
                r_line.item_id,
                r_line.qty_ordered,
                r_line.unit
            );
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_slot_id, v_lot_id;
END;
$$;


ALTER FUNCTION public.fn_init_default_po_slot_lot(p_purchase_order_id uuid) OWNER TO neondb_owner;

--
-- TOC entry 290 (class 1255 OID 73912)
-- Name: fn_init_shipment_milestones(uuid); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_init_shipment_milestones(p_shipment_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO shipment_milestones (
        shipment_id,
        sequence_no,
        milestone_code,
        milestone_name
    )
    VALUES
        (p_shipment_id, 1,  'BOOKING_CONFIRMED', 'Booking confirmed'),
        (p_shipment_id, 2,  'CARGO_READY',       'Cargo ready at origin'),
        (p_shipment_id, 3,  'PICKED_UP',         'Picked up at origin'),
        (p_shipment_id, 4,  'BL_ISSUED',         'BL/AWB issued'),
        (p_shipment_id, 5,  'GATE_IN_POL',       'Gate in port of loading'),
        (p_shipment_id, 6,  'ATD',               'Actual time of departure'),
        (p_shipment_id, 7,  'CUSTOMS_DRAFT',     'Customs draft/submitted'),
        (p_shipment_id, 8,  'ARRIVAL_NOTICE',    'Arrival notice / ATA'),
        (p_shipment_id, 9,  'CUSTOMS_CLEARED',   'Customs cleared'),
        (p_shipment_id, 10, 'DELIVERED',         'EDO and delivery')
    ON CONFLICT DO NOTHING;
END;
$$;


ALTER FUNCTION public.fn_init_shipment_milestones(p_shipment_id uuid) OWNER TO neondb_owner;

--
-- TOC entry 281 (class 1255 OID 59793)
-- Name: fn_log_quotation_event(uuid, character varying, character varying, character varying, character varying, text, jsonb); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_log_quotation_event(p_quotation_id uuid, p_event_type character varying, p_old_status character varying DEFAULT NULL::character varying, p_new_status character varying DEFAULT NULL::character varying, p_actor_name character varying DEFAULT NULL::character varying, p_note text DEFAULT NULL::text, p_payload jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO quotation_events (
        quotation_id,
        event_type,
        old_status,
        new_status,
        actor_name,
        note,
        payload
    )
    VALUES (
        p_quotation_id,
        p_event_type,
        p_old_status,
        p_new_status,
        p_actor_name,
        p_note,
        p_payload
    );
END;
$$;


ALTER FUNCTION public.fn_log_quotation_event(p_quotation_id uuid, p_event_type character varying, p_old_status character varying, p_new_status character varying, p_actor_name character varying, p_note text, p_payload jsonb) OWNER TO neondb_owner;

--
-- TOC entry 288 (class 1255 OID 59804)
-- Name: fn_mark_quotation_final(uuid, character varying, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_mark_quotation_final(p_quotation_id uuid, p_actor_name character varying DEFAULT NULL::character varying, p_note text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_quotation quotations%ROWTYPE;
    v_charge_count INT;
BEGIN
    SELECT *
    INTO v_quotation
    FROM quotations
    WHERE id = p_quotation_id
      AND is_delete = FALSE
    FOR UPDATE;

    IF v_quotation.id IS NULL THEN
        RAISE EXCEPTION 'Quotation not found';
    END IF;

    IF v_quotation.status IN ('REJECTED', 'CANCELLED', 'EXPIRED') THEN
        RAISE EXCEPTION 'Cannot mark quotation final when status is %', v_quotation.status;
    END IF;

    SELECT COUNT(*)
    INTO v_charge_count
    FROM quotation_charge_lines
    WHERE quotation_id = p_quotation_id
      AND is_delete = FALSE;

    IF v_charge_count = 0 THEN
        RAISE EXCEPTION 'Cannot mark quotation final without charge lines';
    END IF;

    UPDATE quotations
    SET
        is_final = FALSE,
        update_at = NOW()
    WHERE quotation_group_id = v_quotation.quotation_group_id
      AND id <> p_quotation_id
      AND is_delete = FALSE;

    UPDATE quotations
    SET
        status = 'CONFIRMED_BY_KBI',
        is_final = TRUE,
        confirmed_at = COALESCE(confirmed_at, NOW()),
        update_at = NOW()
    WHERE id = p_quotation_id;

    IF v_quotation.ref_type = 'DELIVERY_ORDER' THEN
        UPDATE delivery_orders
        SET
            status = 'QUOTATION_CONFIRMED',
            update_at = NOW()
        WHERE id = v_quotation.ref_id
          AND is_delete = FALSE
          AND status NOT IN ('ASSIGNED_TO_SHIPMENT', 'CANCELLED', 'CLOSED');
    END IF;

    PERFORM fn_log_quotation_event(
        p_quotation_id,
        'MARKED_FINAL',
        v_quotation.status,
        'CONFIRMED_BY_KBI',
        p_actor_name,
        COALESCE(p_note, 'Quotation marked as final'),
        NULL
    );
END;
$$;


ALTER FUNCTION public.fn_mark_quotation_final(p_quotation_id uuid, p_actor_name character varying, p_note text) OWNER TO neondb_owner;

--
-- TOC entry 296 (class 1255 OID 73921)
-- Name: fn_mark_shipment_milestone_done(uuid, character varying, timestamp with time zone, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_mark_shipment_milestone_done(p_shipment_id uuid, p_milestone_code character varying, p_actual_at timestamp with time zone DEFAULT now(), p_notes text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_new_shipment_status VARCHAR(30);
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM shipments
        WHERE id = p_shipment_id
          AND is_delete = FALSE
          AND status <> 'CANCELLED'
    ) THEN
        RAISE EXCEPTION 'Shipment not found or cancelled';
    END IF;

    UPDATE shipment_milestones
    SET
        actual_at = p_actual_at,
        status = 'DONE',
        notes = COALESCE(p_notes, notes),
        update_at = NOW()
    WHERE shipment_id = p_shipment_id
      AND milestone_code = p_milestone_code
      AND is_delete = FALSE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Shipment milestone not found';
    END IF;

    v_new_shipment_status := CASE p_milestone_code
        WHEN 'BOOKING_CONFIRMED' THEN 'BOOKING_CONFIRMED'
        WHEN 'CARGO_READY' THEN 'CARGO_READY'
        WHEN 'PICKED_UP' THEN 'PICKED_UP'
        WHEN 'BL_ISSUED' THEN 'BL_ISSUED'
        WHEN 'GATE_IN_POL' THEN 'GATE_IN_POL'
        WHEN 'ATD' THEN 'IN_TRANSIT'
        WHEN 'CUSTOMS_DRAFT' THEN 'CUSTOMS_DRAFT'
        WHEN 'ARRIVAL_NOTICE' THEN 'ARRIVED'
        WHEN 'CUSTOMS_CLEARED' THEN 'CUSTOMS_CLEARED'
        WHEN 'DELIVERED' THEN 'DELIVERED'
        ELSE NULL
    END;

    IF v_new_shipment_status IS NOT NULL THEN
        UPDATE shipments
        SET
            status = v_new_shipment_status,
            update_at = NOW(),
            atd = CASE
                WHEN p_milestone_code = 'ATD'
                THEN p_actual_at::DATE
                ELSE atd
            END,
            ata = CASE
                WHEN p_milestone_code = 'ARRIVAL_NOTICE'
                THEN p_actual_at::DATE
                ELSE ata
            END
        WHERE id = p_shipment_id;
    END IF;
END;
$$;


ALTER FUNCTION public.fn_mark_shipment_milestone_done(p_shipment_id uuid, p_milestone_code character varying, p_actual_at timestamp with time zone, p_notes text) OWNER TO neondb_owner;

--
-- TOC entry 300 (class 1255 OID 82035)
-- Name: fn_open_customs_draft(uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_open_customs_draft(p_customs_declaration_id uuid, p_opened_at timestamp with time zone DEFAULT now()) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE customs_declarations
    SET
        status = 'DRAFT_OPENED',
        draft_opened_at = COALESCE(draft_opened_at, p_opened_at),
        update_at = NOW()
    WHERE id = p_customs_declaration_id
      AND is_delete = FALSE
      AND status IN ('DRAFT');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cannot open customs draft in current status';
    END IF;
END;
$$;


ALTER FUNCTION public.fn_open_customs_draft(p_customs_declaration_id uuid, p_opened_at timestamp with time zone) OWNER TO neondb_owner;

--
-- TOC entry 301 (class 1255 OID 82036)
-- Name: fn_open_customs_official(uuid, character varying, character varying, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_open_customs_official(p_customs_declaration_id uuid, p_declaration_no character varying, p_customs_channel character varying, p_opened_at timestamp with time zone DEFAULT now()) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF p_declaration_no IS NULL OR p_declaration_no = '' THEN
        RAISE EXCEPTION 'declaration_no is required';
    END IF;

    IF p_customs_channel NOT IN ('GREEN', 'YELLOW', 'RED') THEN
        RAISE EXCEPTION 'Invalid customs_channel %', p_customs_channel;
    END IF;

    UPDATE customs_declarations
    SET
        declaration_no = p_declaration_no,
        customs_channel = p_customs_channel,
        status = 'OFFICIAL_OPENED',
        official_opened_at = COALESCE(official_opened_at, p_opened_at),
        update_at = NOW()
    WHERE id = p_customs_declaration_id
      AND is_delete = FALSE
      AND status IN ('DRAFT', 'DRAFT_OPENED');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cannot open customs official in current status';
    END IF;
END;
$$;


ALTER FUNCTION public.fn_open_customs_official(p_customs_declaration_id uuid, p_declaration_no character varying, p_customs_channel character varying, p_opened_at timestamp with time zone) OWNER TO neondb_owner;

--
-- TOC entry 257 (class 1255 OID 59637)
-- Name: fn_refresh_po_line_qty_confirmed(uuid); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_refresh_po_line_qty_confirmed(p_purchase_order_line_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE purchase_order_lines pol
    SET
        qty_confirmed = COALESCE((
            SELECT SUM(pocl.confirmed_qty)
            FROM purchase_order_confirmation_lines pocl
            JOIN purchase_order_confirmations poc
                ON poc.id = pocl.purchase_order_confirmation_id
            WHERE pocl.purchase_order_line_id = p_purchase_order_line_id
              AND pocl.is_delete = FALSE
              AND poc.is_delete = FALSE
        ), 0),
        update_at = NOW()
    WHERE pol.id = p_purchase_order_line_id;
END;
$$;


ALTER FUNCTION public.fn_refresh_po_line_qty_confirmed(p_purchase_order_line_id uuid) OWNER TO neondb_owner;

--
-- TOC entry 272 (class 1255 OID 59642)
-- Name: fn_refresh_po_line_qty_lotted(uuid); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_refresh_po_line_qty_lotted(p_purchase_order_line_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE purchase_order_lines pol
    SET
        qty_lotted = COALESCE((
            SELECT SUM(pll.qty_lotted)
            FROM po_lot_lines pll
            JOIN po_lots pl
                ON pl.id = pll.po_lot_id
            WHERE pll.purchase_order_line_id = p_purchase_order_line_id
              AND pll.is_delete = FALSE
              AND pl.is_delete = FALSE
              AND pl.status <> 'CANCELLED'
        ), 0),
        update_at = NOW()
    WHERE pol.id = p_purchase_order_line_id;
END;
$$;


ALTER FUNCTION public.fn_refresh_po_line_qty_lotted(p_purchase_order_line_id uuid) OWNER TO neondb_owner;

--
-- TOC entry 292 (class 1255 OID 73915)
-- Name: fn_refresh_po_line_qty_shipped(uuid); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_refresh_po_line_qty_shipped(p_purchase_order_line_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE purchase_order_lines pol
    SET
        qty_shipped = COALESCE((
            SELECT SUM(sl.qty_shipped)
            FROM shipment_lines sl
            JOIN shipments s
                ON s.id = sl.shipment_id
            WHERE sl.purchase_order_line_id = p_purchase_order_line_id
              AND sl.is_delete = FALSE
              AND s.is_delete = FALSE
              AND s.status <> 'CANCELLED'
        ), 0),
        update_at = NOW()
    WHERE pol.id = p_purchase_order_line_id;
END;
$$;


ALTER FUNCTION public.fn_refresh_po_line_qty_shipped(p_purchase_order_line_id uuid) OWNER TO neondb_owner;

--
-- TOC entry 285 (class 1255 OID 59800)
-- Name: fn_refresh_quotation_totals(uuid); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_refresh_quotation_totals(p_quotation_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE quotations q
    SET
        total_amount = COALESCE((
            SELECT SUM(qcl.amount)
            FROM quotation_charge_lines qcl
            WHERE qcl.quotation_id = p_quotation_id
              AND qcl.is_delete = FALSE
        ), 0),
        total_tax_amount = COALESCE((
            SELECT SUM(qcl.tax_amount)
            FROM quotation_charge_lines qcl
            WHERE qcl.quotation_id = p_quotation_id
              AND qcl.is_delete = FALSE
        ), 0),
        grand_total_amount = COALESCE((
            SELECT SUM(qcl.total_amount)
            FROM quotation_charge_lines qcl
            WHERE qcl.quotation_id = p_quotation_id
              AND qcl.is_delete = FALSE
        ), 0),
        update_at = NOW()
    WHERE q.id = p_quotation_id;
END;
$$;


ALTER FUNCTION public.fn_refresh_quotation_totals(p_quotation_id uuid) OWNER TO neondb_owner;

--
-- TOC entry 258 (class 1255 OID 59018)
-- Name: fn_set_update_at(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_set_update_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.update_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_set_update_at() OWNER TO neondb_owner;

--
-- TOC entry 297 (class 1255 OID 82029)
-- Name: fn_validate_customs_declaration(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_customs_declaration() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_shipment_status TEXT;
BEGIN
    SELECT status::TEXT
    INTO v_shipment_status
    FROM shipments
    WHERE id = NEW.shipment_id
      AND is_delete = FALSE;

    IF v_shipment_status IS NULL THEN
        RAISE EXCEPTION 'Shipment not found';
    END IF;

    IF v_shipment_status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Cannot create customs declaration for cancelled shipment';
    END IF;

    IF TG_OP = 'UPDATE'
       AND OLD.status IN ('CLEARED', 'CANCELLED')
       AND (
            OLD.shipment_id IS DISTINCT FROM NEW.shipment_id
            OR OLD.declaration_no IS DISTINCT FROM NEW.declaration_no
            OR OLD.is_delete IS DISTINCT FROM NEW.is_delete
       ) THEN
        RAISE EXCEPTION 'Cannot change locked customs declaration';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_customs_declaration() OWNER TO neondb_owner;

--
-- TOC entry 298 (class 1255 OID 82031)
-- Name: fn_validate_customs_declaration_line(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_customs_declaration_line() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_declaration_shipment_id UUID;
    v_declaration_status TEXT;

    v_shipment_line_shipment_id UUID;
    v_shipment_line_po_line_id UUID;
    v_shipment_line_item_id UUID;
    v_shipment_line_qty NUMERIC(18,4);
    v_shipment_line_unit VARCHAR(50);
    v_shipment_line_desc TEXT;

    v_profile RECORD;

    v_existing_qty NUMERIC(18,4);
    v_total_qty NUMERIC(18,4);
    v_effective_duty_rate NUMERIC(5,2);
BEGIN
    SELECT shipment_id, status::TEXT
    INTO v_declaration_shipment_id, v_declaration_status
    FROM customs_declarations
    WHERE id = NEW.customs_declaration_id
      AND is_delete = FALSE;

    IF v_declaration_shipment_id IS NULL THEN
        RAISE EXCEPTION 'Customs declaration not found';
    END IF;

    IF v_declaration_status IN ('CLEARED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Cannot change lines of customs declaration when status is %', v_declaration_status;
    END IF;

    IF NEW.shipment_line_id IS NOT NULL THEN
        SELECT
            sl.shipment_id,
            sl.purchase_order_line_id,
            sl.item_id,
            sl.qty_shipped,
            sl.unit,
            sl.item_description
        INTO
            v_shipment_line_shipment_id,
            v_shipment_line_po_line_id,
            v_shipment_line_item_id,
            v_shipment_line_qty,
            v_shipment_line_unit,
            v_shipment_line_desc
        FROM shipment_lines sl
        WHERE sl.id = NEW.shipment_line_id
          AND sl.is_delete = FALSE;

        IF v_shipment_line_shipment_id IS NULL THEN
            RAISE EXCEPTION 'Shipment line not found';
        END IF;

        IF v_shipment_line_shipment_id <> v_declaration_shipment_id THEN
            RAISE EXCEPTION 'Customs line shipment_line does not belong to declaration shipment';
        END IF;

        IF NEW.purchase_order_line_id <> v_shipment_line_po_line_id THEN
            RAISE EXCEPTION 'purchase_order_line_id must match shipment_line';
        END IF;

        IF NEW.item_id <> v_shipment_line_item_id THEN
            RAISE EXCEPTION 'item_id must match shipment_line';
        END IF;

        IF NEW.unit IS NULL OR NEW.unit = '' THEN
            NEW.unit := v_shipment_line_unit;
        END IF;

        IF NEW.item_description IS NULL THEN
            NEW.item_description := v_shipment_line_desc;
        END IF;

        SELECT COALESCE(SUM(quantity), 0)
        INTO v_existing_qty
        FROM customs_declaration_lines
        WHERE shipment_line_id = NEW.shipment_line_id
          AND id <> NEW.id
          AND is_delete = FALSE;

        v_total_qty := v_existing_qty + CASE
            WHEN NEW.is_delete = TRUE THEN 0
            ELSE NEW.quantity
        END;

        IF v_total_qty > v_shipment_line_qty THEN
            RAISE EXCEPTION
                'Customs quantity exceeds shipment line quantity. customs_qty=%, shipment_qty=%',
                v_total_qty,
                v_shipment_line_qty;
        END IF;
    END IF;

    SELECT *
    INTO v_profile
    FROM item_customs_profiles icp
    WHERE icp.item_id = NEW.item_id
      AND icp.is_delete = FALSE
    ORDER BY
        CASE WHEN icp.id = NEW.item_customs_profile_id THEN 0 ELSE 1 END,
        icp.is_default DESC
    LIMIT 1;

    IF NEW.item_customs_profile_id IS NULL AND v_profile.id IS NOT NULL THEN
        NEW.item_customs_profile_id := v_profile.id;
    END IF;

    IF NEW.hs_code IS NULL AND v_profile.hs_code IS NOT NULL THEN
        NEW.hs_code := v_profile.hs_code;
    END IF;

    IF NEW.import_duty_rate IS NULL AND v_profile.import_duty_rate IS NOT NULL THEN
        NEW.import_duty_rate := v_profile.import_duty_rate;
    END IF;

    IF NEW.preferential_tax_rate IS NULL
       AND v_profile.preferential_import_duty_rate IS NOT NULL THEN
        NEW.preferential_tax_rate := v_profile.preferential_import_duty_rate;
    END IF;

    IF NEW.vat_rate IS NULL AND v_profile.vat_rate IS NOT NULL THEN
        NEW.vat_rate := v_profile.vat_rate;
    END IF;

    IF NEW.co_form IS NULL AND v_profile.co_form IS NOT NULL THEN
        NEW.co_form := v_profile.co_form;
    END IF;

    v_effective_duty_rate := COALESCE(
        NEW.preferential_tax_rate,
        NEW.import_duty_rate,
        0
    );

    NEW.import_duty_amount :=
        ROUND((NEW.customs_value * v_effective_duty_rate / 100)::NUMERIC, 4);

    NEW.vat_amount :=
        ROUND(((NEW.customs_value + NEW.import_duty_amount) * COALESCE(NEW.vat_rate, 0) / 100)::NUMERIC, 4);

    NEW.total_tax_amount :=
        NEW.import_duty_amount + NEW.vat_amount;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_customs_declaration_line() OWNER TO neondb_owner;

--
-- TOC entry 277 (class 1255 OID 59650)
-- Name: fn_validate_delivery_order(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_delivery_order() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_po_status TEXT;
BEGIN
    SELECT status::TEXT
    INTO v_po_status
    FROM purchase_orders
    WHERE id = NEW.purchase_order_id
      AND is_delete = FALSE;

    IF v_po_status IS NULL THEN
        RAISE EXCEPTION 'Purchase order not found';
    END IF;

    IF TG_OP = 'INSERT'
       AND v_po_status NOT IN ('CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP') THEN
        RAISE EXCEPTION 'Cannot create DO when PO status is %', v_po_status;
    END IF;

    IF TG_OP = 'UPDATE'
       AND OLD.status::TEXT IN ('ASSIGNED_TO_SHIPMENT', 'CANCELLED', 'CLOSED')
       AND (
            OLD.purchase_order_id IS DISTINCT FROM NEW.purchase_order_id
            OR OLD.is_delete IS DISTINCT FROM NEW.is_delete
       ) THEN
        RAISE EXCEPTION 'Cannot change locked delivery order';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_delivery_order() OWNER TO neondb_owner;

--
-- TOC entry 279 (class 1255 OID 59654)
-- Name: fn_validate_delivery_order_line(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_delivery_order_line() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_dol_do_id UUID;
    v_po_lot_id UUID;

    v_do_po_id UUID;
    v_do_status TEXT;

    v_pol_po_id UUID;
    v_pol_item_id UUID;
    v_pol_unit VARCHAR(50);
    v_pol_desc TEXT;

    v_lot_line_qty NUMERIC(18,4);
    v_existing_qty NUMERIC(18,4);
    v_total_qty NUMERIC(18,4);
BEGIN
    SELECT delivery_order_id, po_lot_id
    INTO v_dol_do_id, v_po_lot_id
    FROM delivery_order_lots
    WHERE id = NEW.delivery_order_lot_id
      AND is_delete = FALSE;

    IF v_dol_do_id IS NULL THEN
        RAISE EXCEPTION 'Delivery order lot not found';
    END IF;

    IF v_dol_do_id <> NEW.delivery_order_id THEN
        RAISE EXCEPTION 'delivery_order_line does not match delivery_order_lot';
    END IF;

    SELECT purchase_order_id, status::TEXT
    INTO v_do_po_id, v_do_status
    FROM delivery_orders
    WHERE id = NEW.delivery_order_id
      AND is_delete = FALSE;

    IF v_do_po_id IS NULL THEN
        RAISE EXCEPTION 'Delivery order not found';
    END IF;

    IF v_do_status IN ('ASSIGNED_TO_SHIPMENT', 'CANCELLED', 'CLOSED') THEN
        RAISE EXCEPTION 'Cannot change lines of locked delivery order';
    END IF;

    SELECT purchase_order_id, item_id, unit, item_description
    INTO v_pol_po_id, v_pol_item_id, v_pol_unit, v_pol_desc
    FROM purchase_order_lines
    WHERE id = NEW.purchase_order_line_id
      AND is_delete = FALSE;

    IF v_pol_po_id IS NULL THEN
        RAISE EXCEPTION 'Purchase order line not found';
    END IF;

    IF v_do_po_id <> v_pol_po_id THEN
        RAISE EXCEPTION 'Delivery order line and PO line must belong to same PO';
    END IF;

    IF NEW.item_id <> v_pol_item_id THEN
        RAISE EXCEPTION 'delivery_order_lines.item_id must match purchase_order_lines.item_id';
    END IF;

    SELECT qty_lotted
    INTO v_lot_line_qty
    FROM po_lot_lines
    WHERE po_lot_id = v_po_lot_id
      AND purchase_order_line_id = NEW.purchase_order_line_id
      AND is_delete = FALSE;

    IF v_lot_line_qty IS NULL THEN
        RAISE EXCEPTION 'PO line does not exist in selected LOT';
    END IF;

    SELECT COALESCE(SUM(qty), 0)
    INTO v_existing_qty
    FROM delivery_order_lines
    WHERE delivery_order_lot_id = NEW.delivery_order_lot_id
      AND purchase_order_line_id = NEW.purchase_order_line_id
      AND id <> NEW.id
      AND is_delete = FALSE;

    v_total_qty := v_existing_qty + CASE WHEN NEW.is_delete = TRUE THEN 0 ELSE NEW.qty END;

    IF v_total_qty > v_lot_line_qty THEN
        RAISE EXCEPTION
            'DO qty exceeds LOT qty. do_qty=%, lot_qty=%',
            v_total_qty,
            v_lot_line_qty;
    END IF;

    IF NEW.unit IS NULL OR NEW.unit = '' THEN
        NEW.unit := v_pol_unit;
    END IF;

    IF NEW.item_description IS NULL THEN
        NEW.item_description := v_pol_desc;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_delivery_order_line() OWNER TO neondb_owner;

--
-- TOC entry 278 (class 1255 OID 59652)
-- Name: fn_validate_delivery_order_lot(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_delivery_order_lot() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_do_po_id UUID;
    v_do_status TEXT;

    v_lot_po_id UUID;
    v_lot_status TEXT;
    v_lot_no VARCHAR(50);
    v_lot_name VARCHAR(150);
BEGIN
    SELECT purchase_order_id, status::TEXT
    INTO v_do_po_id, v_do_status
    FROM delivery_orders
    WHERE id = NEW.delivery_order_id
      AND is_delete = FALSE;

    IF v_do_po_id IS NULL THEN
        RAISE EXCEPTION 'Delivery order not found';
    END IF;

    IF v_do_status IN ('ASSIGNED_TO_SHIPMENT', 'CANCELLED', 'CLOSED') THEN
        RAISE EXCEPTION 'Cannot change lots of locked delivery order';
    END IF;

    SELECT purchase_order_id, status::TEXT, lot_no, lot_name
    INTO v_lot_po_id, v_lot_status, v_lot_no, v_lot_name
    FROM po_lots
    WHERE id = NEW.po_lot_id
      AND is_delete = FALSE;

    IF v_lot_po_id IS NULL THEN
        RAISE EXCEPTION 'PO lot not found';
    END IF;

    IF v_do_po_id <> v_lot_po_id THEN
        RAISE EXCEPTION 'Delivery order and LOT must belong to same PO';
    END IF;

    IF v_lot_status IN ('ASSIGNED_TO_SHIPMENT', 'SHIPPED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Cannot assign locked LOT to delivery order';
    END IF;

    IF NEW.lot_no IS NULL OR NEW.lot_no = '' THEN
        NEW.lot_no := v_lot_no;
    END IF;

    IF NEW.lot_name IS NULL THEN
        NEW.lot_name := v_lot_name;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_delivery_order_lot() OWNER TO neondb_owner;

--
-- TOC entry 270 (class 1255 OID 59638)
-- Name: fn_validate_po_confirmation_line(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_po_confirmation_line() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_confirmation_po_id UUID;
    v_line_po_id UUID;
    v_qty_ordered NUMERIC(18,4);
    v_total_confirmed NUMERIC(18,4);
    v_new_qty NUMERIC(18,4);
BEGIN
    SELECT purchase_order_id
    INTO v_confirmation_po_id
    FROM purchase_order_confirmations
    WHERE id = NEW.purchase_order_confirmation_id
      AND is_delete = FALSE;

    IF v_confirmation_po_id IS NULL THEN
        RAISE EXCEPTION 'Invalid purchase_order_confirmation_id';
    END IF;

    SELECT purchase_order_id, qty_ordered
    INTO v_line_po_id, v_qty_ordered
    FROM purchase_order_lines
    WHERE id = NEW.purchase_order_line_id
      AND is_delete = FALSE;

    IF v_line_po_id IS NULL THEN
        RAISE EXCEPTION 'Invalid purchase_order_line_id';
    END IF;

    IF v_confirmation_po_id <> v_line_po_id THEN
        RAISE EXCEPTION 'Confirmation line does not belong to same PO';
    END IF;

    v_new_qty := CASE WHEN NEW.is_delete = TRUE THEN 0 ELSE NEW.confirmed_qty END;

    SELECT COALESCE(SUM(pocl.confirmed_qty), 0)
    INTO v_total_confirmed
    FROM purchase_order_confirmation_lines pocl
    JOIN purchase_order_confirmations poc
        ON poc.id = pocl.purchase_order_confirmation_id
    WHERE pocl.purchase_order_line_id = NEW.purchase_order_line_id
      AND pocl.id <> NEW.id
      AND pocl.is_delete = FALSE
      AND poc.is_delete = FALSE;

    v_total_confirmed := v_total_confirmed + v_new_qty;

    IF v_total_confirmed > v_qty_ordered THEN
        RAISE EXCEPTION
            'confirmed_qty exceeds qty_ordered. confirmed=%, ordered=%',
            v_total_confirmed,
            v_qty_ordered;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_po_confirmation_line() OWNER TO neondb_owner;

--
-- TOC entry 273 (class 1255 OID 59643)
-- Name: fn_validate_po_lot(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_po_lot() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_slot_po_id UUID;
BEGIN
    SELECT purchase_order_id
    INTO v_slot_po_id
    FROM po_delivery_slots
    WHERE id = NEW.delivery_slot_id
      AND is_delete = FALSE;

    IF v_slot_po_id IS NULL THEN
        RAISE EXCEPTION 'Invalid delivery_slot_id';
    END IF;

    IF v_slot_po_id <> NEW.purchase_order_id THEN
        RAISE EXCEPTION 'LOT and Slot must belong to same PO';
    END IF;

    IF TG_OP = 'UPDATE'
       AND OLD.status IN ('ASSIGNED_TO_SHIPMENT', 'SHIPPED', 'CANCELLED')
       AND (
            OLD.delivery_slot_id IS DISTINCT FROM NEW.delivery_slot_id
            OR OLD.sort_order IS DISTINCT FROM NEW.sort_order
            OR OLD.is_delete IS DISTINCT FROM NEW.is_delete
       ) THEN
        RAISE EXCEPTION 'Cannot move/reorder/delete locked LOT';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_po_lot() OWNER TO neondb_owner;

--
-- TOC entry 274 (class 1255 OID 59645)
-- Name: fn_validate_po_lot_line(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_po_lot_line() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_lot_po_id UUID;
    v_lot_status TEXT;

    v_line_po_id UUID;
    v_line_item_id UUID;
    v_line_unit VARCHAR(50);
    v_qty_ordered NUMERIC(18,4);

    v_total_lotted NUMERIC(18,4);
    v_new_qty NUMERIC(18,4);
    v_old_lot_status TEXT;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        SELECT status::TEXT
        INTO v_old_lot_status
        FROM po_lots
        WHERE id = OLD.po_lot_id;

        IF v_old_lot_status IN ('ASSIGNED_TO_SHIPMENT', 'SHIPPED', 'CANCELLED')
           AND (
                OLD.qty_lotted IS DISTINCT FROM NEW.qty_lotted
                OR OLD.po_lot_id IS DISTINCT FROM NEW.po_lot_id
                OR OLD.purchase_order_line_id IS DISTINCT FROM NEW.purchase_order_line_id
                OR OLD.is_delete IS DISTINCT FROM NEW.is_delete
           ) THEN
            RAISE EXCEPTION 'Cannot change LOT line of locked LOT';
        END IF;
    END IF;

    SELECT purchase_order_id, status::TEXT
    INTO v_lot_po_id, v_lot_status
    FROM po_lots
    WHERE id = NEW.po_lot_id
      AND is_delete = FALSE;

    IF v_lot_po_id IS NULL THEN
        RAISE EXCEPTION 'Invalid po_lot_id';
    END IF;

    IF v_lot_status IN ('ASSIGNED_TO_SHIPMENT', 'SHIPPED', 'CANCELLED')
       AND NEW.is_delete = FALSE THEN
        RAISE EXCEPTION 'Cannot add/change lines in locked LOT';
    END IF;

    SELECT purchase_order_id, item_id, unit, qty_ordered
    INTO v_line_po_id, v_line_item_id, v_line_unit, v_qty_ordered
    FROM purchase_order_lines
    WHERE id = NEW.purchase_order_line_id
      AND is_delete = FALSE;

    IF v_line_po_id IS NULL THEN
        RAISE EXCEPTION 'Invalid purchase_order_line_id';
    END IF;

    IF v_lot_po_id <> v_line_po_id THEN
        RAISE EXCEPTION 'LOT line and PO line must belong to same PO';
    END IF;

    IF NEW.item_id <> v_line_item_id THEN
        RAISE EXCEPTION 'po_lot_lines.item_id must match purchase_order_lines.item_id';
    END IF;

    IF NEW.unit IS NULL OR NEW.unit = '' THEN
        NEW.unit := v_line_unit;
    END IF;

    v_new_qty := CASE WHEN NEW.is_delete = TRUE THEN 0 ELSE NEW.qty_lotted END;

    SELECT COALESCE(SUM(pll.qty_lotted), 0)
    INTO v_total_lotted
    FROM po_lot_lines pll
    JOIN po_lots pl
        ON pl.id = pll.po_lot_id
    WHERE pll.purchase_order_line_id = NEW.purchase_order_line_id
      AND pll.id <> NEW.id
      AND pll.is_delete = FALSE
      AND pl.is_delete = FALSE
      AND pl.status <> 'CANCELLED';

    v_total_lotted := v_total_lotted + v_new_qty;

    IF v_total_lotted > v_qty_ordered THEN
        RAISE EXCEPTION
            'total qty_lotted exceeds qty_ordered. lotted=%, ordered=%',
            v_total_lotted,
            v_qty_ordered;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_po_lot_line() OWNER TO neondb_owner;

--
-- TOC entry 282 (class 1255 OID 59794)
-- Name: fn_validate_quotation(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_quotation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_do_status TEXT;
BEGIN
    IF NEW.ref_type = 'DELIVERY_ORDER' THEN
        SELECT status::TEXT
        INTO v_do_status
        FROM delivery_orders
        WHERE id = NEW.ref_id
          AND is_delete = FALSE;

        IF v_do_status IS NULL THEN
            RAISE EXCEPTION 'Delivery order not found for quotation ref_id %', NEW.ref_id;
        END IF;

        IF v_do_status IN ('ASSIGNED_TO_SHIPMENT', 'CANCELLED', 'CLOSED') THEN
            RAISE EXCEPTION 'Cannot create/update quotation for locked delivery order. status=%', v_do_status;
        END IF;
    END IF;

    IF TG_OP = 'UPDATE'
       AND OLD.status IN ('CONFIRMED_BY_KBI', 'REJECTED', 'CANCELLED', 'EXPIRED')
       AND (
            OLD.ref_type IS DISTINCT FROM NEW.ref_type
            OR OLD.ref_id IS DISTINCT FROM NEW.ref_id
            OR OLD.supplier_id IS DISTINCT FROM NEW.supplier_id
            OR OLD.currency_id IS DISTINCT FROM NEW.currency_id
            OR OLD.exchange_rate IS DISTINCT FROM NEW.exchange_rate
            OR OLD.is_delete IS DISTINCT FROM NEW.is_delete
       ) THEN
        RAISE EXCEPTION 'Cannot change locked quotation';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_quotation() OWNER TO neondb_owner;

--
-- TOC entry 289 (class 1255 OID 73910)
-- Name: fn_validate_shipment(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_shipment() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_do_po_id UUID;
    v_do_status TEXT;
    v_quotation_is_final BOOLEAN;
    v_quotation_status TEXT;
    v_quotation_ref_type TEXT;
    v_quotation_ref_id UUID;
BEGIN
    SELECT purchase_order_id, status::TEXT
    INTO v_do_po_id, v_do_status
    FROM delivery_orders
    WHERE id = NEW.delivery_order_id
      AND is_delete = FALSE;

    IF v_do_po_id IS NULL THEN
        RAISE EXCEPTION 'Delivery order not found';
    END IF;

    IF NEW.purchase_order_id <> v_do_po_id THEN
        RAISE EXCEPTION 'Shipment purchase_order_id must match delivery order purchase_order_id';
    END IF;

    IF TG_OP = 'INSERT'
       AND v_do_status <> 'QUOTATION_CONFIRMED' THEN
        RAISE EXCEPTION 'Cannot create shipment when delivery order status is %', v_do_status;
    END IF;

    IF NEW.final_quotation_id IS NOT NULL THEN
        SELECT
            is_final,
            status::TEXT,
            ref_type::TEXT,
            ref_id
        INTO
            v_quotation_is_final,
            v_quotation_status,
            v_quotation_ref_type,
            v_quotation_ref_id
        FROM quotations
        WHERE id = NEW.final_quotation_id
          AND is_delete = FALSE;

        IF v_quotation_is_final IS NULL THEN
            RAISE EXCEPTION 'Final quotation not found';
        END IF;

        IF v_quotation_is_final = FALSE
           OR v_quotation_status <> 'CONFIRMED_BY_KBI' THEN
            RAISE EXCEPTION 'Quotation must be final and CONFIRMED_BY_KBI';
        END IF;

        IF v_quotation_ref_type <> 'DELIVERY_ORDER'
           OR v_quotation_ref_id <> NEW.delivery_order_id THEN
            RAISE EXCEPTION 'Quotation does not belong to this delivery order';
        END IF;
    END IF;

    IF TG_OP = 'UPDATE'
       AND OLD.status IN ('DELIVERED', 'CANCELLED')
       AND (
            OLD.delivery_order_id IS DISTINCT FROM NEW.delivery_order_id
            OR OLD.purchase_order_id IS DISTINCT FROM NEW.purchase_order_id
            OR OLD.is_delete IS DISTINCT FROM NEW.is_delete
       ) THEN
        RAISE EXCEPTION 'Cannot change locked shipment';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_shipment() OWNER TO neondb_owner;

--
-- TOC entry 293 (class 1255 OID 73916)
-- Name: fn_validate_shipment_line(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_validate_shipment_line() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_shipment_do_id UUID;
    v_shipment_status TEXT;

    v_do_line_do_id UUID;
    v_do_line_lot_id UUID;
    v_do_line_po_line_id UUID;
    v_do_line_item_id UUID;
    v_do_line_qty NUMERIC(18,4);
    v_do_line_unit VARCHAR(50);
    v_do_line_desc TEXT;

    v_po_lot_id UUID;

    v_existing_qty NUMERIC(18,4);
    v_total_qty NUMERIC(18,4);
BEGIN
    SELECT delivery_order_id, status::TEXT
    INTO v_shipment_do_id, v_shipment_status
    FROM shipments
    WHERE id = NEW.shipment_id
      AND is_delete = FALSE;

    IF v_shipment_do_id IS NULL THEN
        RAISE EXCEPTION 'Shipment not found';
    END IF;

    IF v_shipment_status IN ('DELIVERED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Cannot change lines of locked shipment';
    END IF;

    SELECT
        delivery_order_id,
        delivery_order_lot_id,
        purchase_order_line_id,
        item_id,
        qty,
        unit,
        item_description
    INTO
        v_do_line_do_id,
        v_do_line_lot_id,
        v_do_line_po_line_id,
        v_do_line_item_id,
        v_do_line_qty,
        v_do_line_unit,
        v_do_line_desc
    FROM delivery_order_lines
    WHERE id = NEW.delivery_order_line_id
      AND is_delete = FALSE;

    IF v_do_line_do_id IS NULL THEN
        RAISE EXCEPTION 'Delivery order line not found';
    END IF;

    IF v_do_line_do_id <> v_shipment_do_id THEN
        RAISE EXCEPTION 'Shipment line delivery_order_line does not belong to shipment delivery_order';
    END IF;

    IF NEW.purchase_order_line_id <> v_do_line_po_line_id THEN
        RAISE EXCEPTION 'purchase_order_line_id must match delivery_order_line';
    END IF;

    IF NEW.item_id <> v_do_line_item_id THEN
        RAISE EXCEPTION 'item_id must match delivery_order_line';
    END IF;

    SELECT dol.po_lot_id
    INTO v_po_lot_id
    FROM delivery_order_lots dol
    WHERE dol.id = v_do_line_lot_id
      AND dol.is_delete = FALSE;

    NEW.delivery_order_lot_id := v_do_line_lot_id;
    NEW.po_lot_id := v_po_lot_id;

    IF NEW.unit IS NULL OR NEW.unit = '' THEN
        NEW.unit := v_do_line_unit;
    END IF;

    IF NEW.item_description IS NULL THEN
        NEW.item_description := v_do_line_desc;
    END IF;

    SELECT COALESCE(SUM(qty_shipped), 0)
    INTO v_existing_qty
    FROM shipment_lines
    WHERE delivery_order_line_id = NEW.delivery_order_line_id
      AND id <> NEW.id
      AND is_delete = FALSE;

    v_total_qty := v_existing_qty + CASE
        WHEN NEW.is_delete = TRUE THEN 0
        ELSE NEW.qty_shipped
    END;

    IF v_total_qty > v_do_line_qty THEN
        RAISE EXCEPTION
            'Shipment qty exceeds delivery order line qty. shipment_qty=%, do_qty=%',
            v_total_qty,
            v_do_line_qty;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_shipment_line() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 59099)
-- Name: currencies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.currencies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    currency_code character varying(10) NOT NULL,
    currency_name character varying(100) NOT NULL,
    symbol character varying(10),
    decimal_places integer DEFAULT 2 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_currencies_decimal_places CHECK (((decimal_places >= 0) AND (decimal_places <= 6)))
);


ALTER TABLE public.currencies OWNER TO neondb_owner;

--
-- TOC entry 246 (class 1259 OID 81958)
-- Name: customs_declaration_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customs_declaration_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customs_declaration_id uuid NOT NULL,
    shipment_line_id uuid,
    purchase_order_line_id uuid NOT NULL,
    item_id uuid NOT NULL,
    item_customs_profile_id uuid,
    line_no integer NOT NULL,
    hs_code character varying(30),
    item_description text,
    quantity numeric(18,4) NOT NULL,
    unit character varying(50) NOT NULL,
    customs_value numeric(18,4) DEFAULT 0 NOT NULL,
    currency_id uuid,
    import_duty_rate numeric(5,2) DEFAULT 0,
    preferential_tax_rate numeric(5,2),
    vat_rate numeric(5,2) DEFAULT 0,
    import_duty_amount numeric(18,4) DEFAULT 0 NOT NULL,
    vat_amount numeric(18,4) DEFAULT 0 NOT NULL,
    total_tax_amount numeric(18,4) DEFAULT 0 NOT NULL,
    co_form character varying(50),
    note text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_customs_declaration_lines_qty CHECK (((is_delete = true) OR (quantity > (0)::numeric))),
    CONSTRAINT chk_customs_declaration_lines_rates CHECK ((((import_duty_rate IS NULL) OR ((import_duty_rate >= (0)::numeric) AND (import_duty_rate <= (100)::numeric))) AND ((preferential_tax_rate IS NULL) OR ((preferential_tax_rate >= (0)::numeric) AND (preferential_tax_rate <= (100)::numeric))) AND ((vat_rate IS NULL) OR ((vat_rate >= (0)::numeric) AND (vat_rate <= (100)::numeric))))),
    CONSTRAINT chk_customs_declaration_lines_value CHECK (((customs_value >= (0)::numeric) AND (import_duty_amount >= (0)::numeric) AND (vat_amount >= (0)::numeric) AND (total_tax_amount >= (0)::numeric)))
);


ALTER TABLE public.customs_declaration_lines OWNER TO neondb_owner;

--
-- TOC entry 245 (class 1259 OID 81920)
-- Name: customs_declarations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customs_declarations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    shipment_id uuid NOT NULL,
    declaration_no character varying(100),
    customs_type character varying(50) DEFAULT 'IMPORT'::character varying NOT NULL,
    customs_channel character varying(20),
    broker_id uuid,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    draft_opened_at timestamp with time zone,
    official_opened_at timestamp with time zone,
    submitted_at timestamp with time zone,
    cleared_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancel_reason text,
    note text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_customs_declarations_channel CHECK (((customs_channel IS NULL) OR ((customs_channel)::text = ANY ((ARRAY['GREEN'::character varying, 'YELLOW'::character varying, 'RED'::character varying])::text[])))),
    CONSTRAINT chk_customs_declarations_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'DRAFT_OPENED'::character varying, 'OFFICIAL_OPENED'::character varying, 'SUBMITTED'::character varying, 'INSPECTION'::character varying, 'CLEARED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT chk_customs_declarations_type CHECK (((customs_type)::text = ANY ((ARRAY['IMPORT'::character varying, 'TEMP_IMPORT'::character varying, 'RE_IMPORT'::character varying, 'OTHER'::character varying])::text[])))
);


ALTER TABLE public.customs_declarations OWNER TO neondb_owner;

--
-- TOC entry 237 (class 1259 OID 59590)
-- Name: delivery_order_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.delivery_order_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    delivery_order_id uuid NOT NULL,
    delivery_order_lot_id uuid NOT NULL,
    purchase_order_line_id uuid NOT NULL,
    item_id uuid NOT NULL,
    item_description text,
    qty numeric(18,4) NOT NULL,
    unit character varying(50) NOT NULL,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_delivery_order_lines_qty CHECK (((is_delete = true) OR (qty > (0)::numeric)))
);


ALTER TABLE public.delivery_order_lines OWNER TO neondb_owner;

--
-- TOC entry 236 (class 1259 OID 59557)
-- Name: delivery_order_lots; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.delivery_order_lots (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    delivery_order_id uuid NOT NULL,
    po_lot_id uuid NOT NULL,
    lot_no character varying(50) NOT NULL,
    lot_name character varying(150),
    planned_cargo_ready_date date,
    planned_etd date,
    planned_eta date,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL
);


ALTER TABLE public.delivery_order_lots OWNER TO neondb_owner;

--
-- TOC entry 235 (class 1259 OID 59523)
-- Name: delivery_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.delivery_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    do_no character varying(50) NOT NULL,
    purchase_order_id uuid NOT NULL,
    transport_mode_id uuid,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    planned_cargo_ready_date date,
    planned_etd date,
    planned_eta date,
    origin_address text,
    destination_address text,
    warehouse_name character varying(255),
    requested_by character varying(150),
    handled_by character varying(150),
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_delivery_orders_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'READY_FOR_QUOTATION'::character varying, 'QUOTATION_CONFIRMED'::character varying, 'ASSIGNED_TO_SHIPMENT'::character varying, 'CANCELLED'::character varying, 'CLOSED'::character varying])::text[])))
);


ALTER TABLE public.delivery_orders OWNER TO neondb_owner;

--
-- TOC entry 224 (class 1259 OID 59123)
-- Name: incoterms; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.incoterms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    incoterm_code character varying(20) NOT NULL,
    incoterm_name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL
);


ALTER TABLE public.incoterms OWNER TO neondb_owner;

--
-- TOC entry 222 (class 1259 OID 59072)
-- Name: item_customs_profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.item_customs_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    item_id uuid NOT NULL,
    hs_code character varying(20),
    import_duty_rate numeric(5,2),
    vat_rate numeric(5,2),
    co_form character varying(50),
    co_tax_note text,
    customs_type character varying(50),
    customs_note text,
    reference_doc_no character varying(100),
    location_code character varying(50),
    tax_note text,
    preferential_import_duty_rate numeric(5,2),
    is_default boolean DEFAULT true NOT NULL,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_item_customs_profiles_rates CHECK ((((import_duty_rate IS NULL) OR ((import_duty_rate >= (0)::numeric) AND (import_duty_rate <= (100)::numeric))) AND ((vat_rate IS NULL) OR ((vat_rate >= (0)::numeric) AND (vat_rate <= (100)::numeric))) AND ((preferential_import_duty_rate IS NULL) OR ((preferential_import_duty_rate >= (0)::numeric) AND (preferential_import_duty_rate <= (100)::numeric)))))
);


ALTER TABLE public.item_customs_profiles OWNER TO neondb_owner;

--
-- TOC entry 220 (class 1259 OID 59019)
-- Name: item_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.item_groups (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    group_code character varying(50),
    group_name character varying(255) NOT NULL,
    description text,
    default_hs_code character varying(20),
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL
);


ALTER TABLE public.item_groups OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 59037)
-- Name: item_master; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.item_master (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    item_code character varying(100) NOT NULL,
    item_name character varying(255) NOT NULL,
    item_description text,
    item_group_id uuid,
    unit character varying(50),
    item_type character varying(50),
    origin_country character varying(100),
    brand character varying(100),
    model character varying(100),
    is_new boolean DEFAULT true NOT NULL,
    lead_time_days integer DEFAULT 0 NOT NULL,
    moq numeric(18,4) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_item_master_lead_time CHECK ((lead_time_days >= 0)),
    CONSTRAINT chk_item_master_moq CHECK ((moq >= (0)::numeric))
);


ALTER TABLE public.item_master OWNER TO neondb_owner;

--
-- TOC entry 232 (class 1259 OID 59414)
-- Name: po_delivery_slots; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.po_delivery_slots (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_id uuid NOT NULL,
    slot_no character varying(50) NOT NULL,
    slot_name character varying(150),
    planned_cargo_ready_date date,
    planned_etd date,
    planned_eta date,
    delivery_address text,
    warehouse_name character varying(255),
    status character varying(30) DEFAULT 'PLANNED'::character varying NOT NULL,
    sort_order integer DEFAULT 1 NOT NULL,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_po_delivery_slots_sort_order CHECK ((sort_order >= 0)),
    CONSTRAINT chk_po_delivery_slots_status CHECK (((status)::text = ANY ((ARRAY['PLANNED'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.po_delivery_slots OWNER TO neondb_owner;

--
-- TOC entry 234 (class 1259 OID 59483)
-- Name: po_lot_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.po_lot_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    po_lot_id uuid NOT NULL,
    purchase_order_line_id uuid NOT NULL,
    item_id uuid NOT NULL,
    qty_lotted numeric(18,4) NOT NULL,
    unit character varying(50) NOT NULL,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_po_lot_lines_qty CHECK (((is_delete = true) OR (qty_lotted > (0)::numeric)))
);


ALTER TABLE public.po_lot_lines OWNER TO neondb_owner;

--
-- TOC entry 233 (class 1259 OID 59445)
-- Name: po_lots; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.po_lots (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_id uuid NOT NULL,
    delivery_slot_id uuid NOT NULL,
    lot_no character varying(50) NOT NULL,
    lot_name character varying(150),
    status character varying(30) DEFAULT 'PLANNED'::character varying NOT NULL,
    planned_cargo_ready_date date,
    planned_etd date,
    planned_eta date,
    sort_order integer DEFAULT 1 NOT NULL,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_po_lots_sort_order CHECK ((sort_order >= 0)),
    CONSTRAINT chk_po_lots_status CHECK (((status)::text = ANY ((ARRAY['PLANNED'::character varying, 'READY'::character varying, 'ASSIGNED_TO_SHIPMENT'::character varying, 'SHIPPED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.po_lots OWNER TO neondb_owner;

--
-- TOC entry 231 (class 1259 OID 59376)
-- Name: purchase_order_confirmation_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchase_order_confirmation_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_confirmation_id uuid CONSTRAINT purchase_order_confirmation_purchase_order_confirmatio_not_null NOT NULL,
    purchase_order_line_id uuid CONSTRAINT purchase_order_confirmation_lin_purchase_order_line_id_not_null NOT NULL,
    confirmed_qty numeric(18,4) DEFAULT 0 NOT NULL,
    cargo_ready_date date,
    can_fulfill boolean DEFAULT true NOT NULL,
    allow_partial_shipment boolean DEFAULT false CONSTRAINT purchase_order_confirmation_lin_allow_partial_shipment_not_null NOT NULL,
    note text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_po_confirmation_lines_cannot_fulfill_qty CHECK (((can_fulfill = true) OR (confirmed_qty = (0)::numeric))),
    CONSTRAINT chk_po_confirmation_lines_qty CHECK ((confirmed_qty >= (0)::numeric))
);


ALTER TABLE public.purchase_order_confirmation_lines OWNER TO neondb_owner;

--
-- TOC entry 230 (class 1259 OID 59347)
-- Name: purchase_order_confirmations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchase_order_confirmations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_id uuid NOT NULL,
    confirmed_by character varying(150),
    confirmed_at timestamp with time zone DEFAULT now() NOT NULL,
    supplier_ref_no character varying(100),
    is_full_shipment boolean DEFAULT true NOT NULL,
    allow_partial_shipment boolean DEFAULT false NOT NULL,
    note text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL
);


ALTER TABLE public.purchase_order_confirmations OWNER TO neondb_owner;

--
-- TOC entry 229 (class 1259 OID 59290)
-- Name: purchase_order_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchase_order_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_order_id uuid NOT NULL,
    item_id uuid NOT NULL,
    item_customs_profile_id uuid,
    line_no integer NOT NULL,
    item_description text,
    qty_ordered numeric(18,4) NOT NULL,
    unit character varying(50) NOT NULL,
    unit_price numeric(18,4) DEFAULT 0 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0 NOT NULL,
    discount_pct numeric(5,2) DEFAULT 0 NOT NULL,
    qty_confirmed numeric(18,4) DEFAULT 0 NOT NULL,
    qty_lotted numeric(18,4) DEFAULT 0 NOT NULL,
    qty_shipped numeric(18,4) DEFAULT 0 NOT NULL,
    qty_received numeric(18,4) DEFAULT 0 NOT NULL,
    expected_eta_line date,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_purchase_order_lines_money CHECK ((unit_price >= (0)::numeric)),
    CONSTRAINT chk_purchase_order_lines_qty_ordered CHECK ((qty_ordered > (0)::numeric)),
    CONSTRAINT chk_purchase_order_lines_rates CHECK (((tax_rate >= (0)::numeric) AND (tax_rate <= (100)::numeric) AND (discount_pct >= (0)::numeric) AND (discount_pct <= (100)::numeric))),
    CONSTRAINT chk_purchase_order_lines_tracking_qty CHECK (((qty_confirmed >= (0)::numeric) AND (qty_lotted >= (0)::numeric) AND (qty_shipped >= (0)::numeric) AND (qty_received >= (0)::numeric)))
);


ALTER TABLE public.purchase_order_lines OWNER TO neondb_owner;

--
-- TOC entry 228 (class 1259 OID 59240)
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    po_no character varying(100) NOT NULL,
    contract_no character varying(100),
    supplier_id uuid NOT NULL,
    currency_id uuid,
    incoterm_id uuid,
    transport_mode_id uuid,
    po_type character varying(50) DEFAULT 'SEA'::character varying NOT NULL,
    payment_term character varying(100),
    exchange_rate numeric(18,6) DEFAULT 1 NOT NULL,
    expected_etd date,
    expected_eta date,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancel_reason text,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_purchase_orders_exchange_rate CHECK ((exchange_rate > (0)::numeric)),
    CONSTRAINT chk_purchase_orders_po_type CHECK (((po_type)::text = ANY ((ARRAY['SEA'::character varying, 'AIR'::character varying, 'DOMESTIC'::character varying])::text[]))),
    CONSTRAINT chk_purchase_orders_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SENT'::character varying, 'CONFIRMED'::character varying, 'IN_PRODUCTION'::character varying, 'READY_TO_SHIP'::character varying, 'SHIPPED'::character varying, 'RECEIVED'::character varying, 'CLOSED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.purchase_orders OWNER TO neondb_owner;

--
-- TOC entry 239 (class 1259 OID 59720)
-- Name: quotation_charge_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotation_charge_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quotation_id uuid NOT NULL,
    line_no integer NOT NULL,
    charge_type character varying(50) NOT NULL,
    description text NOT NULL,
    quantity numeric(18,4) DEFAULT 1 NOT NULL,
    unit character varying(50),
    unit_price numeric(18,4) DEFAULT 0 NOT NULL,
    amount numeric(18,4) DEFAULT 0 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(18,4) DEFAULT 0 NOT NULL,
    total_amount numeric(18,4) DEFAULT 0 NOT NULL,
    note text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_quotation_charge_lines_charge_type CHECK (((charge_type)::text = ANY ((ARRAY['OCEAN_FREIGHT'::character varying, 'AIR_FREIGHT'::character varying, 'LOCAL_CHARGE'::character varying, 'CUSTOMS_FEE'::character varying, 'TRUCKING'::character varying, 'DO_FEE'::character varying, 'DEMURRAGE'::character varying, 'DETENTION'::character varying, 'WAREHOUSE'::character varying, 'DOCUMENT_FEE'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT chk_quotation_charge_lines_money CHECK (((unit_price >= (0)::numeric) AND (amount >= (0)::numeric) AND (tax_amount >= (0)::numeric) AND (total_amount >= (0)::numeric))),
    CONSTRAINT chk_quotation_charge_lines_qty CHECK ((quantity > (0)::numeric)),
    CONSTRAINT chk_quotation_charge_lines_tax_rate CHECK (((tax_rate >= (0)::numeric) AND (tax_rate <= (100)::numeric)))
);


ALTER TABLE public.quotation_charge_lines OWNER TO neondb_owner;

--
-- TOC entry 240 (class 1259 OID 59764)
-- Name: quotation_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotation_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quotation_id uuid NOT NULL,
    event_type character varying(50) NOT NULL,
    old_status character varying(30),
    new_status character varying(30),
    actor_name character varying(150),
    event_at timestamp with time zone DEFAULT now() NOT NULL,
    note text,
    payload jsonb,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_quotation_events_event_type CHECK (((event_type)::text = ANY ((ARRAY['CREATED'::character varying, 'STATUS_CHANGED'::character varying, 'REQUESTED'::character varying, 'RECEIVED'::character varying, 'SUBMITTED_TO_KBI'::character varying, 'CONFIRMED_BY_KBI'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying, 'EXPIRED'::character varying, 'VERSION_CREATED'::character varying, 'MARKED_FINAL'::character varying, 'CHARGE_LINE_CHANGED'::character varying])::text[])))
);


ALTER TABLE public.quotation_events OWNER TO neondb_owner;

--
-- TOC entry 238 (class 1259 OID 59658)
-- Name: quotations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quotation_group_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quotation_no character varying(50) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    ref_type character varying(30) NOT NULL,
    ref_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    quotation_type character varying(30) NOT NULL,
    currency_id uuid NOT NULL,
    exchange_rate numeric(18,6) DEFAULT 1 NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    is_final boolean DEFAULT false NOT NULL,
    quoted_at timestamp with time zone,
    valid_until date,
    submitted_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    rejected_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    total_amount numeric(18,4) DEFAULT 0 NOT NULL,
    total_tax_amount numeric(18,4) DEFAULT 0 NOT NULL,
    grand_total_amount numeric(18,4) DEFAULT 0 NOT NULL,
    note text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_quotations_amounts CHECK (((total_amount >= (0)::numeric) AND (total_tax_amount >= (0)::numeric) AND (grand_total_amount >= (0)::numeric))),
    CONSTRAINT chk_quotations_exchange_rate CHECK ((exchange_rate > (0)::numeric)),
    CONSTRAINT chk_quotations_final_status CHECK (((is_final = false) OR ((status)::text = 'CONFIRMED_BY_KBI'::text))),
    CONSTRAINT chk_quotations_ref_type CHECK (((ref_type)::text = ANY ((ARRAY['DELIVERY_ORDER'::character varying, 'PO'::character varying, 'SHIPMENT'::character varying, 'CARRIER_DO'::character varying, 'DTO'::character varying])::text[]))),
    CONSTRAINT chk_quotations_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'REQUESTED'::character varying, 'RECEIVED'::character varying, 'SUBMITTED_TO_KBI'::character varying, 'CONFIRMED_BY_KBI'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying, 'EXPIRED'::character varying])::text[]))),
    CONSTRAINT chk_quotations_type CHECK (((quotation_type)::text = ANY ((ARRAY['FREIGHT'::character varying, 'LOCAL_CHARGE'::character varying, 'CUSTOMS'::character varying, 'TRUCKING'::character varying, 'MIXED'::character varying])::text[]))),
    CONSTRAINT chk_quotations_version CHECK ((version > 0))
);


ALTER TABLE public.quotations OWNER TO neondb_owner;

--
-- TOC entry 244 (class 1259 OID 73875)
-- Name: shipment_documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shipment_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    shipment_id uuid NOT NULL,
    milestone_id uuid,
    document_type character varying(50) NOT NULL,
    document_no character varying(100),
    file_url text,
    file_name character varying(255),
    mime_type character varying(100),
    issued_date date,
    received_at timestamp with time zone,
    status character varying(30) DEFAULT 'RECEIVED'::character varying NOT NULL,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_shipment_documents_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'RECEIVED'::character varying, 'VERIFIED'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT chk_shipment_documents_type CHECK (((document_type)::text = ANY ((ARRAY['COMMERCIAL_INVOICE'::character varying, 'PACKING_LIST'::character varying, 'CONTRACT'::character varying, 'BOOKING_CONFIRMATION'::character varying, 'BILL_OF_LADING'::character varying, 'AIR_WAYBILL'::character varying, 'ARRIVAL_NOTICE'::character varying, 'CERTIFICATE_OF_ORIGIN'::character varying, 'INSURANCE'::character varying, 'CUSTOMS_DECLARATION'::character varying, 'EDO'::character varying, 'POD'::character varying, 'OTHER'::character varying])::text[])))
);


ALTER TABLE public.shipment_documents OWNER TO neondb_owner;

--
-- TOC entry 242 (class 1259 OID 73784)
-- Name: shipment_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shipment_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    shipment_id uuid NOT NULL,
    delivery_order_line_id uuid NOT NULL,
    delivery_order_lot_id uuid,
    purchase_order_line_id uuid NOT NULL,
    po_lot_id uuid,
    item_id uuid NOT NULL,
    item_description text,
    qty_shipped numeric(18,4) NOT NULL,
    unit character varying(50) NOT NULL,
    lot_no character varying(50),
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_shipment_lines_qty CHECK (((is_delete = true) OR (qty_shipped > (0)::numeric)))
);


ALTER TABLE public.shipment_lines OWNER TO neondb_owner;

--
-- TOC entry 243 (class 1259 OID 73841)
-- Name: shipment_milestones; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shipment_milestones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    shipment_id uuid NOT NULL,
    sequence_no integer NOT NULL,
    milestone_code character varying(50) NOT NULL,
    milestone_name character varying(150) NOT NULL,
    planned_at timestamp with time zone,
    actual_at timestamp with time zone,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_shipment_milestones_code CHECK (((milestone_code)::text = ANY ((ARRAY['BOOKING_CONFIRMED'::character varying, 'CARGO_READY'::character varying, 'PICKED_UP'::character varying, 'BL_ISSUED'::character varying, 'GATE_IN_POL'::character varying, 'ATD'::character varying, 'CUSTOMS_DRAFT'::character varying, 'ARRIVAL_NOTICE'::character varying, 'CUSTOMS_CLEARED'::character varying, 'DELIVERED'::character varying])::text[]))),
    CONSTRAINT chk_shipment_milestones_sequence CHECK ((sequence_no > 0)),
    CONSTRAINT chk_shipment_milestones_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_PROGRESS'::character varying, 'DONE'::character varying, 'SKIPPED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.shipment_milestones OWNER TO neondb_owner;

--
-- TOC entry 241 (class 1259 OID 73728)
-- Name: shipments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shipments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    shipment_no character varying(50) NOT NULL,
    delivery_order_id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    final_quotation_id uuid,
    transport_mode_id uuid,
    forwarder_id uuid,
    carrier character varying(150),
    mode character varying(30) NOT NULL,
    vessel_flight character varying(150),
    voyage_no character varying(100),
    bl_awb_no character varying(100),
    container_no jsonb,
    pol character varying(150),
    pod character varying(150),
    etd date,
    eta date,
    atd date,
    ata date,
    status character varying(30) DEFAULT 'BOOKING_PENDING'::character varying NOT NULL,
    customs_channel character varying(20),
    package_qty numeric(18,4),
    gross_weight numeric(18,4),
    net_weight numeric(18,4),
    cbm numeric(18,4),
    notes text,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_shipments_customs_channel CHECK (((customs_channel IS NULL) OR ((customs_channel)::text = ANY ((ARRAY['GREEN'::character varying, 'YELLOW'::character varying, 'RED'::character varying])::text[])))),
    CONSTRAINT chk_shipments_mode CHECK (((mode)::text = ANY ((ARRAY['SEA'::character varying, 'AIR'::character varying, 'ROAD'::character varying, 'RAIL'::character varying, 'MULTIMODAL'::character varying, 'TRUCKING'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT chk_shipments_qty_weight CHECK ((((package_qty IS NULL) OR (package_qty >= (0)::numeric)) AND ((gross_weight IS NULL) OR (gross_weight >= (0)::numeric)) AND ((net_weight IS NULL) OR (net_weight >= (0)::numeric)) AND ((cbm IS NULL) OR (cbm >= (0)::numeric)))),
    CONSTRAINT chk_shipments_status CHECK (((status)::text = ANY ((ARRAY['BOOKING_PENDING'::character varying, 'BOOKING_CONFIRMED'::character varying, 'CARGO_READY'::character varying, 'PICKED_UP'::character varying, 'BL_ISSUED'::character varying, 'GATE_IN_POL'::character varying, 'IN_TRANSIT'::character varying, 'ARRIVED'::character varying, 'CUSTOMS_DRAFT'::character varying, 'CUSTOMS_CLEARED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.shipments OWNER TO neondb_owner;

--
-- TOC entry 227 (class 1259 OID 59209)
-- Name: supplier_transport_modes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.supplier_transport_modes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    supplier_id uuid NOT NULL,
    transport_mode_id uuid NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL
);


ALTER TABLE public.supplier_transport_modes OWNER TO neondb_owner;

--
-- TOC entry 226 (class 1259 OID 59171)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    supplier_code character varying(50) NOT NULL,
    supplier_name character varying(255) NOT NULL,
    supplier_roles text[] DEFAULT ARRAY['SUPPLIER'::text] NOT NULL,
    country character varying(100),
    address text,
    contact_name character varying(100),
    contact_email character varying(100),
    contact_phone character varying(50),
    payment_term character varying(100),
    default_currency_code character varying(10),
    default_incoterm_code character varying(20),
    default_currency_id uuid,
    default_incoterm_id uuid,
    lead_time_days integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_suppliers_lead_time CHECK ((lead_time_days >= 0))
);


ALTER TABLE public.suppliers OWNER TO neondb_owner;

--
-- TOC entry 225 (class 1259 OID 59146)
-- Name: transport_modes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transport_modes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    mode_code character varying(50) NOT NULL,
    mode_name character varying(100) NOT NULL,
    mode_type character varying(50) NOT NULL,
    description text,
    is_international boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    create_at timestamp with time zone DEFAULT now() NOT NULL,
    update_at timestamp with time zone DEFAULT now() NOT NULL,
    delete_at timestamp with time zone,
    is_delete boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_transport_modes_mode_type CHECK (((mode_type)::text = ANY ((ARRAY['SEA'::character varying, 'AIR'::character varying, 'ROAD'::character varying, 'RAIL'::character varying, 'MULTIMODAL'::character varying, 'TRUCKING'::character varying, 'OTHER'::character varying])::text[])))
);


ALTER TABLE public.transport_modes OWNER TO neondb_owner;

--
-- TOC entry 3651 (class 2606 OID 59120)
-- Name: currencies currencies_currency_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_currency_code_key UNIQUE (currency_code);


--
-- TOC entry 3653 (class 2606 OID 59118)
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- TOC entry 3771 (class 2606 OID 81991)
-- Name: customs_declaration_lines customs_declaration_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declaration_lines
    ADD CONSTRAINT customs_declaration_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3765 (class 2606 OID 81942)
-- Name: customs_declarations customs_declarations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declarations
    ADD CONSTRAINT customs_declarations_pkey PRIMARY KEY (id);


--
-- TOC entry 3716 (class 2606 OID 59611)
-- Name: delivery_order_lines delivery_order_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_order_lines
    ADD CONSTRAINT delivery_order_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3710 (class 2606 OID 59574)
-- Name: delivery_order_lots delivery_order_lots_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_order_lots
    ADD CONSTRAINT delivery_order_lots_pkey PRIMARY KEY (id);


--
-- TOC entry 3705 (class 2606 OID 59542)
-- Name: delivery_orders delivery_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_orders
    ADD CONSTRAINT delivery_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3656 (class 2606 OID 59143)
-- Name: incoterms incoterms_incoterm_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.incoterms
    ADD CONSTRAINT incoterms_incoterm_code_key UNIQUE (incoterm_code);


--
-- TOC entry 3658 (class 2606 OID 59141)
-- Name: incoterms incoterms_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.incoterms
    ADD CONSTRAINT incoterms_pkey PRIMARY KEY (id);


--
-- TOC entry 3649 (class 2606 OID 59090)
-- Name: item_customs_profiles item_customs_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_customs_profiles
    ADD CONSTRAINT item_customs_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 3640 (class 2606 OID 59034)
-- Name: item_groups item_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_groups
    ADD CONSTRAINT item_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 3644 (class 2606 OID 59063)
-- Name: item_master item_master_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_master
    ADD CONSTRAINT item_master_pkey PRIMARY KEY (id);


--
-- TOC entry 3692 (class 2606 OID 59436)
-- Name: po_delivery_slots po_delivery_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_delivery_slots
    ADD CONSTRAINT po_delivery_slots_pkey PRIMARY KEY (id);


--
-- TOC entry 3702 (class 2606 OID 59503)
-- Name: po_lot_lines po_lot_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_lot_lines
    ADD CONSTRAINT po_lot_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3697 (class 2606 OID 59468)
-- Name: po_lots po_lots_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_lots
    ADD CONSTRAINT po_lots_pkey PRIMARY KEY (id);


--
-- TOC entry 3688 (class 2606 OID 59400)
-- Name: purchase_order_confirmation_lines purchase_order_confirmation_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_confirmation_lines
    ADD CONSTRAINT purchase_order_confirmation_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3685 (class 2606 OID 59368)
-- Name: purchase_order_confirmations purchase_order_confirmations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_confirmations
    ADD CONSTRAINT purchase_order_confirmations_pkey PRIMARY KEY (id);


--
-- TOC entry 3681 (class 2606 OID 59327)
-- Name: purchase_order_lines purchase_order_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_lines
    ADD CONSTRAINT purchase_order_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3676 (class 2606 OID 59265)
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3733 (class 2606 OID 59754)
-- Name: quotation_charge_lines quotation_charge_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotation_charge_lines
    ADD CONSTRAINT quotation_charge_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3739 (class 2606 OID 59783)
-- Name: quotation_events quotation_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotation_events
    ADD CONSTRAINT quotation_events_pkey PRIMARY KEY (id);


--
-- TOC entry 3726 (class 2606 OID 59701)
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- TOC entry 3763 (class 2606 OID 73895)
-- Name: shipment_documents shipment_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_documents
    ADD CONSTRAINT shipment_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 3751 (class 2606 OID 73805)
-- Name: shipment_lines shipment_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_lines
    ADD CONSTRAINT shipment_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 73864)
-- Name: shipment_milestones shipment_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_milestones
    ADD CONSTRAINT shipment_milestones_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 73752)
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- TOC entry 3671 (class 2606 OID 59225)
-- Name: supplier_transport_modes supplier_transport_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.supplier_transport_modes
    ADD CONSTRAINT supplier_transport_modes_pkey PRIMARY KEY (id);


--
-- TOC entry 3666 (class 2606 OID 59194)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 3661 (class 2606 OID 59168)
-- Name: transport_modes transport_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transport_modes
    ADD CONSTRAINT transport_modes_pkey PRIMARY KEY (id);


--
-- TOC entry 3772 (class 1259 OID 82023)
-- Name: idx_customs_declaration_lines_declaration; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customs_declaration_lines_declaration ON public.customs_declaration_lines USING btree (customs_declaration_id) WHERE (is_delete = false);


--
-- TOC entry 3773 (class 1259 OID 82027)
-- Name: idx_customs_declaration_lines_hs_code; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customs_declaration_lines_hs_code ON public.customs_declaration_lines USING btree (hs_code) WHERE (is_delete = false);


--
-- TOC entry 3774 (class 1259 OID 82026)
-- Name: idx_customs_declaration_lines_item; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customs_declaration_lines_item ON public.customs_declaration_lines USING btree (item_id) WHERE (is_delete = false);


--
-- TOC entry 3775 (class 1259 OID 82025)
-- Name: idx_customs_declaration_lines_po_line; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customs_declaration_lines_po_line ON public.customs_declaration_lines USING btree (purchase_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3776 (class 1259 OID 82024)
-- Name: idx_customs_declaration_lines_shipment_line; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customs_declaration_lines_shipment_line ON public.customs_declaration_lines USING btree (shipment_line_id) WHERE (is_delete = false);


--
-- TOC entry 3766 (class 1259 OID 81956)
-- Name: idx_customs_declarations_channel; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customs_declarations_channel ON public.customs_declarations USING btree (customs_channel) WHERE (is_delete = false);


--
-- TOC entry 3767 (class 1259 OID 81954)
-- Name: idx_customs_declarations_shipment; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customs_declarations_shipment ON public.customs_declarations USING btree (shipment_id) WHERE (is_delete = false);


--
-- TOC entry 3768 (class 1259 OID 81955)
-- Name: idx_customs_declarations_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customs_declarations_status ON public.customs_declarations USING btree (status) WHERE (is_delete = false);


--
-- TOC entry 3717 (class 1259 OID 59633)
-- Name: idx_delivery_order_lines_do; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_delivery_order_lines_do ON public.delivery_order_lines USING btree (delivery_order_id) WHERE (is_delete = false);


--
-- TOC entry 3718 (class 1259 OID 59635)
-- Name: idx_delivery_order_lines_item; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_delivery_order_lines_item ON public.delivery_order_lines USING btree (item_id) WHERE (is_delete = false);


--
-- TOC entry 3719 (class 1259 OID 59634)
-- Name: idx_delivery_order_lines_po_line; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_delivery_order_lines_po_line ON public.delivery_order_lines USING btree (purchase_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3711 (class 1259 OID 59587)
-- Name: idx_delivery_order_lots_do; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_delivery_order_lots_do ON public.delivery_order_lots USING btree (delivery_order_id) WHERE (is_delete = false);


--
-- TOC entry 3712 (class 1259 OID 59588)
-- Name: idx_delivery_order_lots_po_lot; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_delivery_order_lots_po_lot ON public.delivery_order_lots USING btree (po_lot_id) WHERE (is_delete = false);


--
-- TOC entry 3706 (class 1259 OID 59554)
-- Name: idx_delivery_orders_po; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_delivery_orders_po ON public.delivery_orders USING btree (purchase_order_id) WHERE (is_delete = false);


--
-- TOC entry 3707 (class 1259 OID 59555)
-- Name: idx_delivery_orders_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_delivery_orders_status ON public.delivery_orders USING btree (status) WHERE (is_delete = false);


--
-- TOC entry 3646 (class 1259 OID 59097)
-- Name: idx_item_customs_profiles_hs_code; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_item_customs_profiles_hs_code ON public.item_customs_profiles USING btree (hs_code) WHERE (is_delete = false);


--
-- TOC entry 3647 (class 1259 OID 59096)
-- Name: idx_item_customs_profiles_item; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_item_customs_profiles_item ON public.item_customs_profiles USING btree (item_id) WHERE (is_delete = false);


--
-- TOC entry 3642 (class 1259 OID 59070)
-- Name: idx_item_master_group; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_item_master_group ON public.item_master USING btree (item_group_id) WHERE (is_delete = false);


--
-- TOC entry 3686 (class 1259 OID 59412)
-- Name: idx_po_confirmation_lines_po_line; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_po_confirmation_lines_po_line ON public.purchase_order_confirmation_lines USING btree (purchase_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3683 (class 1259 OID 59374)
-- Name: idx_po_confirmations_po; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_po_confirmations_po ON public.purchase_order_confirmations USING btree (purchase_order_id) WHERE (is_delete = false);


--
-- TOC entry 3690 (class 1259 OID 59443)
-- Name: idx_po_delivery_slots_po; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_po_delivery_slots_po ON public.po_delivery_slots USING btree (purchase_order_id) WHERE (is_delete = false);


--
-- TOC entry 3699 (class 1259 OID 59520)
-- Name: idx_po_lot_lines_lot; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_po_lot_lines_lot ON public.po_lot_lines USING btree (po_lot_id) WHERE (is_delete = false);


--
-- TOC entry 3700 (class 1259 OID 59521)
-- Name: idx_po_lot_lines_po_line; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_po_lot_lines_po_line ON public.po_lot_lines USING btree (purchase_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3694 (class 1259 OID 59480)
-- Name: idx_po_lots_po; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_po_lots_po ON public.po_lots USING btree (purchase_order_id) WHERE (is_delete = false);


--
-- TOC entry 3695 (class 1259 OID 59481)
-- Name: idx_po_lots_slot; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_po_lots_slot ON public.po_lots USING btree (delivery_slot_id) WHERE (is_delete = false);


--
-- TOC entry 3678 (class 1259 OID 59345)
-- Name: idx_purchase_order_lines_item; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_purchase_order_lines_item ON public.purchase_order_lines USING btree (item_id) WHERE (is_delete = false);


--
-- TOC entry 3679 (class 1259 OID 59344)
-- Name: idx_purchase_order_lines_po; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_purchase_order_lines_po ON public.purchase_order_lines USING btree (purchase_order_id) WHERE (is_delete = false);


--
-- TOC entry 3673 (class 1259 OID 59288)
-- Name: idx_purchase_orders_status_eta; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_purchase_orders_status_eta ON public.purchase_orders USING btree (status, expected_eta) WHERE (is_delete = false);


--
-- TOC entry 3674 (class 1259 OID 59287)
-- Name: idx_purchase_orders_supplier; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders USING btree (supplier_id) WHERE (is_delete = false);


--
-- TOC entry 3730 (class 1259 OID 59762)
-- Name: idx_quotation_charge_lines_charge_type; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotation_charge_lines_charge_type ON public.quotation_charge_lines USING btree (charge_type) WHERE (is_delete = false);


--
-- TOC entry 3731 (class 1259 OID 59761)
-- Name: idx_quotation_charge_lines_quotation; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotation_charge_lines_quotation ON public.quotation_charge_lines USING btree (quotation_id) WHERE (is_delete = false);


--
-- TOC entry 3735 (class 1259 OID 59791)
-- Name: idx_quotation_events_event_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotation_events_event_at ON public.quotation_events USING btree (event_at) WHERE (is_delete = false);


--
-- TOC entry 3736 (class 1259 OID 59789)
-- Name: idx_quotation_events_quotation; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotation_events_quotation ON public.quotation_events USING btree (quotation_id) WHERE (is_delete = false);


--
-- TOC entry 3737 (class 1259 OID 59790)
-- Name: idx_quotation_events_type; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotation_events_type ON public.quotation_events USING btree (event_type) WHERE (is_delete = false);


--
-- TOC entry 3721 (class 1259 OID 59718)
-- Name: idx_quotations_group; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotations_group ON public.quotations USING btree (quotation_group_id) WHERE (is_delete = false);


--
-- TOC entry 3722 (class 1259 OID 59715)
-- Name: idx_quotations_ref; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotations_ref ON public.quotations USING btree (ref_type, ref_id) WHERE (is_delete = false);


--
-- TOC entry 3723 (class 1259 OID 59717)
-- Name: idx_quotations_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotations_status ON public.quotations USING btree (status) WHERE (is_delete = false);


--
-- TOC entry 3724 (class 1259 OID 59716)
-- Name: idx_quotations_supplier; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quotations_supplier ON public.quotations USING btree (supplier_id) WHERE (is_delete = false);


--
-- TOC entry 3759 (class 1259 OID 73907)
-- Name: idx_shipment_documents_milestone; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipment_documents_milestone ON public.shipment_documents USING btree (milestone_id) WHERE (is_delete = false);


--
-- TOC entry 3760 (class 1259 OID 73906)
-- Name: idx_shipment_documents_shipment; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipment_documents_shipment ON public.shipment_documents USING btree (shipment_id) WHERE (is_delete = false);


--
-- TOC entry 3761 (class 1259 OID 73908)
-- Name: idx_shipment_documents_type; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipment_documents_type ON public.shipment_documents USING btree (document_type) WHERE (is_delete = false);


--
-- TOC entry 3747 (class 1259 OID 73839)
-- Name: idx_shipment_lines_item; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipment_lines_item ON public.shipment_lines USING btree (item_id) WHERE (is_delete = false);


--
-- TOC entry 3748 (class 1259 OID 73838)
-- Name: idx_shipment_lines_po_line; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipment_lines_po_line ON public.shipment_lines USING btree (purchase_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3749 (class 1259 OID 73837)
-- Name: idx_shipment_lines_shipment; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipment_lines_shipment ON public.shipment_lines USING btree (shipment_id) WHERE (is_delete = false);


--
-- TOC entry 3753 (class 1259 OID 73872)
-- Name: idx_shipment_milestones_shipment; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipment_milestones_shipment ON public.shipment_milestones USING btree (shipment_id) WHERE (is_delete = false);


--
-- TOC entry 3754 (class 1259 OID 73873)
-- Name: idx_shipment_milestones_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipment_milestones_status ON public.shipment_milestones USING btree (status) WHERE (is_delete = false);


--
-- TOC entry 3740 (class 1259 OID 73781)
-- Name: idx_shipments_forwarder; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipments_forwarder ON public.shipments USING btree (forwarder_id) WHERE (is_delete = false);


--
-- TOC entry 3741 (class 1259 OID 73780)
-- Name: idx_shipments_po; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipments_po ON public.shipments USING btree (purchase_order_id) WHERE (is_delete = false);


--
-- TOC entry 3742 (class 1259 OID 73782)
-- Name: idx_shipments_status_eta; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_shipments_status_eta ON public.shipments USING btree (status, eta) WHERE (is_delete = false);


--
-- TOC entry 3668 (class 1259 OID 59238)
-- Name: idx_supplier_transport_modes_mode; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_supplier_transport_modes_mode ON public.supplier_transport_modes USING btree (transport_mode_id) WHERE (is_delete = false);


--
-- TOC entry 3669 (class 1259 OID 59237)
-- Name: idx_supplier_transport_modes_supplier; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_supplier_transport_modes_supplier ON public.supplier_transport_modes USING btree (supplier_id) WHERE (is_delete = false);


--
-- TOC entry 3663 (class 1259 OID 59206)
-- Name: idx_suppliers_currency; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_suppliers_currency ON public.suppliers USING btree (default_currency_id) WHERE (is_delete = false);


--
-- TOC entry 3664 (class 1259 OID 59207)
-- Name: idx_suppliers_incoterm; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_suppliers_incoterm ON public.suppliers USING btree (default_incoterm_id) WHERE (is_delete = false);


--
-- TOC entry 3654 (class 1259 OID 59121)
-- Name: uq_currencies_code_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_currencies_code_active ON public.currencies USING btree (currency_code) WHERE (is_delete = false);


--
-- TOC entry 3777 (class 1259 OID 82022)
-- Name: uq_customs_declaration_lines_line_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_customs_declaration_lines_line_no_active ON public.customs_declaration_lines USING btree (customs_declaration_id, line_no) WHERE (is_delete = false);


--
-- TOC entry 3769 (class 1259 OID 81953)
-- Name: uq_customs_declarations_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_customs_declarations_no_active ON public.customs_declarations USING btree (declaration_no) WHERE ((is_delete = false) AND (declaration_no IS NOT NULL));


--
-- TOC entry 3720 (class 1259 OID 59632)
-- Name: uq_delivery_order_lines_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_delivery_order_lines_active ON public.delivery_order_lines USING btree (delivery_order_lot_id, purchase_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3713 (class 1259 OID 59586)
-- Name: uq_delivery_order_lots_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_delivery_order_lots_active ON public.delivery_order_lots USING btree (delivery_order_id, po_lot_id) WHERE (is_delete = false);


--
-- TOC entry 3714 (class 1259 OID 59585)
-- Name: uq_delivery_order_lots_po_lot_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_delivery_order_lots_po_lot_active ON public.delivery_order_lots USING btree (po_lot_id) WHERE (is_delete = false);


--
-- TOC entry 3708 (class 1259 OID 59553)
-- Name: uq_delivery_orders_do_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_delivery_orders_do_no_active ON public.delivery_orders USING btree (do_no) WHERE (is_delete = false);


--
-- TOC entry 3659 (class 1259 OID 59144)
-- Name: uq_incoterms_code_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_incoterms_code_active ON public.incoterms USING btree (incoterm_code) WHERE (is_delete = false);


--
-- TOC entry 3641 (class 1259 OID 59035)
-- Name: uq_item_groups_group_code_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_item_groups_group_code_active ON public.item_groups USING btree (group_code) WHERE ((is_delete = false) AND (group_code IS NOT NULL));


--
-- TOC entry 3645 (class 1259 OID 59069)
-- Name: uq_item_master_item_code_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_item_master_item_code_active ON public.item_master USING btree (item_code) WHERE (is_delete = false);


--
-- TOC entry 3689 (class 1259 OID 59411)
-- Name: uq_po_confirmation_lines_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_po_confirmation_lines_active ON public.purchase_order_confirmation_lines USING btree (purchase_order_confirmation_id, purchase_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3693 (class 1259 OID 59442)
-- Name: uq_po_delivery_slots_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_po_delivery_slots_no_active ON public.po_delivery_slots USING btree (purchase_order_id, slot_no) WHERE (is_delete = false);


--
-- TOC entry 3703 (class 1259 OID 59519)
-- Name: uq_po_lot_lines_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_po_lot_lines_active ON public.po_lot_lines USING btree (po_lot_id, purchase_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3698 (class 1259 OID 59479)
-- Name: uq_po_lots_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_po_lots_no_active ON public.po_lots USING btree (purchase_order_id, lot_no) WHERE (is_delete = false);


--
-- TOC entry 3682 (class 1259 OID 59343)
-- Name: uq_purchase_order_lines_line_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_purchase_order_lines_line_no_active ON public.purchase_order_lines USING btree (purchase_order_id, line_no) WHERE (is_delete = false);


--
-- TOC entry 3677 (class 1259 OID 59286)
-- Name: uq_purchase_orders_po_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_purchase_orders_po_no_active ON public.purchase_orders USING btree (po_no) WHERE (is_delete = false);


--
-- TOC entry 3734 (class 1259 OID 59760)
-- Name: uq_quotation_charge_lines_line_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_quotation_charge_lines_line_no_active ON public.quotation_charge_lines USING btree (quotation_id, line_no) WHERE (is_delete = false);


--
-- TOC entry 3727 (class 1259 OID 59713)
-- Name: uq_quotations_group_version_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_quotations_group_version_active ON public.quotations USING btree (quotation_group_id, version) WHERE (is_delete = false);


--
-- TOC entry 3728 (class 1259 OID 59712)
-- Name: uq_quotations_no_version_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_quotations_no_version_active ON public.quotations USING btree (quotation_no, version) WHERE (is_delete = false);


--
-- TOC entry 3729 (class 1259 OID 59714)
-- Name: uq_quotations_one_final_per_group_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_quotations_one_final_per_group_active ON public.quotations USING btree (quotation_group_id) WHERE ((is_delete = false) AND (is_final = true));


--
-- TOC entry 3752 (class 1259 OID 73836)
-- Name: uq_shipment_lines_do_line_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_shipment_lines_do_line_active ON public.shipment_lines USING btree (shipment_id, delivery_order_line_id) WHERE (is_delete = false);


--
-- TOC entry 3757 (class 1259 OID 73870)
-- Name: uq_shipment_milestones_code_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_shipment_milestones_code_active ON public.shipment_milestones USING btree (shipment_id, milestone_code) WHERE (is_delete = false);


--
-- TOC entry 3758 (class 1259 OID 73871)
-- Name: uq_shipment_milestones_sequence_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_shipment_milestones_sequence_active ON public.shipment_milestones USING btree (shipment_id, sequence_no) WHERE (is_delete = false);


--
-- TOC entry 3745 (class 1259 OID 73778)
-- Name: uq_shipments_delivery_order_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_shipments_delivery_order_active ON public.shipments USING btree (delivery_order_id) WHERE (is_delete = false);


--
-- TOC entry 3746 (class 1259 OID 73779)
-- Name: uq_shipments_no_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_shipments_no_active ON public.shipments USING btree (shipment_no) WHERE (is_delete = false);


--
-- TOC entry 3672 (class 1259 OID 59236)
-- Name: uq_supplier_transport_modes_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_supplier_transport_modes_active ON public.supplier_transport_modes USING btree (supplier_id, transport_mode_id) WHERE (is_delete = false);


--
-- TOC entry 3667 (class 1259 OID 59205)
-- Name: uq_suppliers_code_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_suppliers_code_active ON public.suppliers USING btree (supplier_code) WHERE (is_delete = false);


--
-- TOC entry 3662 (class 1259 OID 59169)
-- Name: uq_transport_modes_code_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_transport_modes_code_active ON public.transport_modes USING btree (mode_code) WHERE (is_delete = false);


--
-- TOC entry 3845 (class 2620 OID 59641)
-- Name: purchase_order_confirmation_lines trg_after_po_confirmation_line_change; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_after_po_confirmation_line_change AFTER INSERT OR DELETE OR UPDATE ON public.purchase_order_confirmation_lines FOR EACH ROW EXECUTE FUNCTION public.fn_after_po_confirmation_line_change();


--
-- TOC entry 3851 (class 2620 OID 59648)
-- Name: po_lot_lines trg_after_po_lot_line_change; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_after_po_lot_line_change AFTER INSERT OR DELETE OR UPDATE ON public.po_lot_lines FOR EACH ROW EXECUTE FUNCTION public.fn_after_po_lot_line_change();


--
-- TOC entry 3860 (class 2620 OID 59797)
-- Name: quotations trg_after_quotation_change; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_after_quotation_change AFTER INSERT OR UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.fn_after_quotation_change();


--
-- TOC entry 3863 (class 2620 OID 59802)
-- Name: quotation_charge_lines trg_after_quotation_charge_line_change; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_after_quotation_charge_line_change AFTER INSERT OR DELETE OR UPDATE ON public.quotation_charge_lines FOR EACH ROW EXECUTE FUNCTION public.fn_after_quotation_charge_line_change();


--
-- TOC entry 3867 (class 2620 OID 73914)
-- Name: shipments trg_after_shipment_created; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_after_shipment_created AFTER INSERT ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.fn_after_shipment_created();


--
-- TOC entry 3870 (class 2620 OID 73919)
-- Name: shipment_lines trg_after_shipment_line_change; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_after_shipment_line_change AFTER INSERT OR DELETE OR UPDATE ON public.shipment_lines FOR EACH ROW EXECUTE FUNCTION public.fn_after_shipment_line_change();


--
-- TOC entry 3864 (class 2620 OID 59799)
-- Name: quotation_charge_lines trg_before_quotation_charge_line_change; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_before_quotation_charge_line_change BEFORE INSERT OR UPDATE ON public.quotation_charge_lines FOR EACH ROW EXECUTE FUNCTION public.fn_before_quotation_charge_line_change();


--
-- TOC entry 3837 (class 2620 OID 59122)
-- Name: currencies trg_currencies_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_currencies_update_at BEFORE UPDATE ON public.currencies FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3877 (class 2620 OID 82028)
-- Name: customs_declaration_lines trg_customs_declaration_lines_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_customs_declaration_lines_update_at BEFORE UPDATE ON public.customs_declaration_lines FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3875 (class 2620 OID 81957)
-- Name: customs_declarations trg_customs_declarations_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_customs_declarations_update_at BEFORE UPDATE ON public.customs_declarations FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3858 (class 2620 OID 59636)
-- Name: delivery_order_lines trg_delivery_order_lines_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_delivery_order_lines_update_at BEFORE UPDATE ON public.delivery_order_lines FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3856 (class 2620 OID 59589)
-- Name: delivery_order_lots trg_delivery_order_lots_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_delivery_order_lots_update_at BEFORE UPDATE ON public.delivery_order_lots FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3854 (class 2620 OID 59556)
-- Name: delivery_orders trg_delivery_orders_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_delivery_orders_update_at BEFORE UPDATE ON public.delivery_orders FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3838 (class 2620 OID 59145)
-- Name: incoterms trg_incoterms_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_incoterms_update_at BEFORE UPDATE ON public.incoterms FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3836 (class 2620 OID 59098)
-- Name: item_customs_profiles trg_item_customs_profiles_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_item_customs_profiles_update_at BEFORE UPDATE ON public.item_customs_profiles FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3834 (class 2620 OID 59036)
-- Name: item_groups trg_item_groups_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_item_groups_update_at BEFORE UPDATE ON public.item_groups FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3835 (class 2620 OID 59071)
-- Name: item_master trg_item_master_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_item_master_update_at BEFORE UPDATE ON public.item_master FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3846 (class 2620 OID 59413)
-- Name: purchase_order_confirmation_lines trg_po_confirmation_lines_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_po_confirmation_lines_update_at BEFORE UPDATE ON public.purchase_order_confirmation_lines FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3844 (class 2620 OID 59375)
-- Name: purchase_order_confirmations trg_po_confirmations_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_po_confirmations_update_at BEFORE UPDATE ON public.purchase_order_confirmations FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3848 (class 2620 OID 59444)
-- Name: po_delivery_slots trg_po_delivery_slots_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_po_delivery_slots_update_at BEFORE UPDATE ON public.po_delivery_slots FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3852 (class 2620 OID 59522)
-- Name: po_lot_lines trg_po_lot_lines_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_po_lot_lines_update_at BEFORE UPDATE ON public.po_lot_lines FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3849 (class 2620 OID 59482)
-- Name: po_lots trg_po_lots_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_po_lots_update_at BEFORE UPDATE ON public.po_lots FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3843 (class 2620 OID 59346)
-- Name: purchase_order_lines trg_purchase_order_lines_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_purchase_order_lines_update_at BEFORE UPDATE ON public.purchase_order_lines FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3842 (class 2620 OID 59289)
-- Name: purchase_orders trg_purchase_orders_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_purchase_orders_update_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3865 (class 2620 OID 59763)
-- Name: quotation_charge_lines trg_quotation_charge_lines_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_quotation_charge_lines_update_at BEFORE UPDATE ON public.quotation_charge_lines FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3866 (class 2620 OID 59792)
-- Name: quotation_events trg_quotation_events_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_quotation_events_update_at BEFORE UPDATE ON public.quotation_events FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3861 (class 2620 OID 59719)
-- Name: quotations trg_quotations_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_quotations_update_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3874 (class 2620 OID 73909)
-- Name: shipment_documents trg_shipment_documents_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_shipment_documents_update_at BEFORE UPDATE ON public.shipment_documents FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3871 (class 2620 OID 73840)
-- Name: shipment_lines trg_shipment_lines_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_shipment_lines_update_at BEFORE UPDATE ON public.shipment_lines FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3873 (class 2620 OID 73874)
-- Name: shipment_milestones trg_shipment_milestones_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_shipment_milestones_update_at BEFORE UPDATE ON public.shipment_milestones FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3868 (class 2620 OID 73783)
-- Name: shipments trg_shipments_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_shipments_update_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3841 (class 2620 OID 59239)
-- Name: supplier_transport_modes trg_supplier_transport_modes_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_supplier_transport_modes_update_at BEFORE UPDATE ON public.supplier_transport_modes FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3840 (class 2620 OID 59208)
-- Name: suppliers trg_suppliers_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_suppliers_update_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3839 (class 2620 OID 59170)
-- Name: transport_modes trg_transport_modes_update_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_transport_modes_update_at BEFORE UPDATE ON public.transport_modes FOR EACH ROW EXECUTE FUNCTION public.fn_set_update_at();


--
-- TOC entry 3876 (class 2620 OID 82030)
-- Name: customs_declarations trg_validate_customs_declaration; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_customs_declaration BEFORE INSERT OR UPDATE ON public.customs_declarations FOR EACH ROW EXECUTE FUNCTION public.fn_validate_customs_declaration();


--
-- TOC entry 3878 (class 2620 OID 82032)
-- Name: customs_declaration_lines trg_validate_customs_declaration_line; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_customs_declaration_line BEFORE INSERT OR UPDATE ON public.customs_declaration_lines FOR EACH ROW EXECUTE FUNCTION public.fn_validate_customs_declaration_line();


--
-- TOC entry 3855 (class 2620 OID 59651)
-- Name: delivery_orders trg_validate_delivery_order; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_delivery_order BEFORE INSERT OR UPDATE ON public.delivery_orders FOR EACH ROW EXECUTE FUNCTION public.fn_validate_delivery_order();


--
-- TOC entry 3859 (class 2620 OID 59655)
-- Name: delivery_order_lines trg_validate_delivery_order_line; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_delivery_order_line BEFORE INSERT OR UPDATE ON public.delivery_order_lines FOR EACH ROW EXECUTE FUNCTION public.fn_validate_delivery_order_line();


--
-- TOC entry 3857 (class 2620 OID 59653)
-- Name: delivery_order_lots trg_validate_delivery_order_lot; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_delivery_order_lot BEFORE INSERT OR UPDATE ON public.delivery_order_lots FOR EACH ROW EXECUTE FUNCTION public.fn_validate_delivery_order_lot();


--
-- TOC entry 3847 (class 2620 OID 59640)
-- Name: purchase_order_confirmation_lines trg_validate_po_confirmation_line; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_po_confirmation_line BEFORE INSERT OR UPDATE ON public.purchase_order_confirmation_lines FOR EACH ROW EXECUTE FUNCTION public.fn_validate_po_confirmation_line();


--
-- TOC entry 3850 (class 2620 OID 59644)
-- Name: po_lots trg_validate_po_lot; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_po_lot BEFORE INSERT OR UPDATE ON public.po_lots FOR EACH ROW EXECUTE FUNCTION public.fn_validate_po_lot();


--
-- TOC entry 3853 (class 2620 OID 59647)
-- Name: po_lot_lines trg_validate_po_lot_line; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_po_lot_line BEFORE INSERT OR UPDATE ON public.po_lot_lines FOR EACH ROW EXECUTE FUNCTION public.fn_validate_po_lot_line();


--
-- TOC entry 3862 (class 2620 OID 59795)
-- Name: quotations trg_validate_quotation; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_quotation BEFORE INSERT OR UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.fn_validate_quotation();


--
-- TOC entry 3869 (class 2620 OID 73911)
-- Name: shipments trg_validate_shipment; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_shipment BEFORE INSERT OR UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.fn_validate_shipment();


--
-- TOC entry 3872 (class 2620 OID 73918)
-- Name: shipment_lines trg_validate_shipment_line; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_validate_shipment_line BEFORE INSERT OR UPDATE ON public.shipment_lines FOR EACH ROW EXECUTE FUNCTION public.fn_validate_shipment_line();


--
-- TOC entry 3828 (class 2606 OID 82017)
-- Name: customs_declaration_lines customs_declaration_lines_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declaration_lines
    ADD CONSTRAINT customs_declaration_lines_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);


--
-- TOC entry 3829 (class 2606 OID 81992)
-- Name: customs_declaration_lines customs_declaration_lines_customs_declaration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declaration_lines
    ADD CONSTRAINT customs_declaration_lines_customs_declaration_id_fkey FOREIGN KEY (customs_declaration_id) REFERENCES public.customs_declarations(id);


--
-- TOC entry 3830 (class 2606 OID 82012)
-- Name: customs_declaration_lines customs_declaration_lines_item_customs_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declaration_lines
    ADD CONSTRAINT customs_declaration_lines_item_customs_profile_id_fkey FOREIGN KEY (item_customs_profile_id) REFERENCES public.item_customs_profiles(id);


--
-- TOC entry 3831 (class 2606 OID 82007)
-- Name: customs_declaration_lines customs_declaration_lines_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declaration_lines
    ADD CONSTRAINT customs_declaration_lines_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item_master(id);


--
-- TOC entry 3832 (class 2606 OID 82002)
-- Name: customs_declaration_lines customs_declaration_lines_purchase_order_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declaration_lines
    ADD CONSTRAINT customs_declaration_lines_purchase_order_line_id_fkey FOREIGN KEY (purchase_order_line_id) REFERENCES public.purchase_order_lines(id);


--
-- TOC entry 3833 (class 2606 OID 81997)
-- Name: customs_declaration_lines customs_declaration_lines_shipment_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declaration_lines
    ADD CONSTRAINT customs_declaration_lines_shipment_line_id_fkey FOREIGN KEY (shipment_line_id) REFERENCES public.shipment_lines(id);


--
-- TOC entry 3826 (class 2606 OID 81948)
-- Name: customs_declarations customs_declarations_broker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declarations
    ADD CONSTRAINT customs_declarations_broker_id_fkey FOREIGN KEY (broker_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3827 (class 2606 OID 81943)
-- Name: customs_declarations customs_declarations_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customs_declarations
    ADD CONSTRAINT customs_declarations_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);


--
-- TOC entry 3804 (class 2606 OID 59612)
-- Name: delivery_order_lines delivery_order_lines_delivery_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_order_lines
    ADD CONSTRAINT delivery_order_lines_delivery_order_id_fkey FOREIGN KEY (delivery_order_id) REFERENCES public.delivery_orders(id);


--
-- TOC entry 3805 (class 2606 OID 59617)
-- Name: delivery_order_lines delivery_order_lines_delivery_order_lot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_order_lines
    ADD CONSTRAINT delivery_order_lines_delivery_order_lot_id_fkey FOREIGN KEY (delivery_order_lot_id) REFERENCES public.delivery_order_lots(id);


--
-- TOC entry 3806 (class 2606 OID 59627)
-- Name: delivery_order_lines delivery_order_lines_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_order_lines
    ADD CONSTRAINT delivery_order_lines_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item_master(id);


--
-- TOC entry 3807 (class 2606 OID 59622)
-- Name: delivery_order_lines delivery_order_lines_purchase_order_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_order_lines
    ADD CONSTRAINT delivery_order_lines_purchase_order_line_id_fkey FOREIGN KEY (purchase_order_line_id) REFERENCES public.purchase_order_lines(id);


--
-- TOC entry 3802 (class 2606 OID 59575)
-- Name: delivery_order_lots delivery_order_lots_delivery_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_order_lots
    ADD CONSTRAINT delivery_order_lots_delivery_order_id_fkey FOREIGN KEY (delivery_order_id) REFERENCES public.delivery_orders(id);


--
-- TOC entry 3803 (class 2606 OID 59580)
-- Name: delivery_order_lots delivery_order_lots_po_lot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_order_lots
    ADD CONSTRAINT delivery_order_lots_po_lot_id_fkey FOREIGN KEY (po_lot_id) REFERENCES public.po_lots(id);


--
-- TOC entry 3800 (class 2606 OID 59543)
-- Name: delivery_orders delivery_orders_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_orders
    ADD CONSTRAINT delivery_orders_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- TOC entry 3801 (class 2606 OID 59548)
-- Name: delivery_orders delivery_orders_transport_mode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_orders
    ADD CONSTRAINT delivery_orders_transport_mode_id_fkey FOREIGN KEY (transport_mode_id) REFERENCES public.transport_modes(id);


--
-- TOC entry 3779 (class 2606 OID 59091)
-- Name: item_customs_profiles item_customs_profiles_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_customs_profiles
    ADD CONSTRAINT item_customs_profiles_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item_master(id);


--
-- TOC entry 3778 (class 2606 OID 59064)
-- Name: item_master item_master_item_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_master
    ADD CONSTRAINT item_master_item_group_id_fkey FOREIGN KEY (item_group_id) REFERENCES public.item_groups(id);


--
-- TOC entry 3794 (class 2606 OID 59437)
-- Name: po_delivery_slots po_delivery_slots_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_delivery_slots
    ADD CONSTRAINT po_delivery_slots_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- TOC entry 3797 (class 2606 OID 59514)
-- Name: po_lot_lines po_lot_lines_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_lot_lines
    ADD CONSTRAINT po_lot_lines_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item_master(id);


--
-- TOC entry 3798 (class 2606 OID 59504)
-- Name: po_lot_lines po_lot_lines_po_lot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_lot_lines
    ADD CONSTRAINT po_lot_lines_po_lot_id_fkey FOREIGN KEY (po_lot_id) REFERENCES public.po_lots(id);


--
-- TOC entry 3799 (class 2606 OID 59509)
-- Name: po_lot_lines po_lot_lines_purchase_order_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_lot_lines
    ADD CONSTRAINT po_lot_lines_purchase_order_line_id_fkey FOREIGN KEY (purchase_order_line_id) REFERENCES public.purchase_order_lines(id);


--
-- TOC entry 3795 (class 2606 OID 59474)
-- Name: po_lots po_lots_delivery_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_lots
    ADD CONSTRAINT po_lots_delivery_slot_id_fkey FOREIGN KEY (delivery_slot_id) REFERENCES public.po_delivery_slots(id);


--
-- TOC entry 3796 (class 2606 OID 59469)
-- Name: po_lots po_lots_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.po_lots
    ADD CONSTRAINT po_lots_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- TOC entry 3792 (class 2606 OID 59401)
-- Name: purchase_order_confirmation_lines purchase_order_confirmation_l_purchase_order_confirmation__fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_confirmation_lines
    ADD CONSTRAINT purchase_order_confirmation_l_purchase_order_confirmation__fkey FOREIGN KEY (purchase_order_confirmation_id) REFERENCES public.purchase_order_confirmations(id);


--
-- TOC entry 3793 (class 2606 OID 59406)
-- Name: purchase_order_confirmation_lines purchase_order_confirmation_lines_purchase_order_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_confirmation_lines
    ADD CONSTRAINT purchase_order_confirmation_lines_purchase_order_line_id_fkey FOREIGN KEY (purchase_order_line_id) REFERENCES public.purchase_order_lines(id);


--
-- TOC entry 3791 (class 2606 OID 59369)
-- Name: purchase_order_confirmations purchase_order_confirmations_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_confirmations
    ADD CONSTRAINT purchase_order_confirmations_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- TOC entry 3788 (class 2606 OID 59338)
-- Name: purchase_order_lines purchase_order_lines_item_customs_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_lines
    ADD CONSTRAINT purchase_order_lines_item_customs_profile_id_fkey FOREIGN KEY (item_customs_profile_id) REFERENCES public.item_customs_profiles(id);


--
-- TOC entry 3789 (class 2606 OID 59333)
-- Name: purchase_order_lines purchase_order_lines_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_lines
    ADD CONSTRAINT purchase_order_lines_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item_master(id);


--
-- TOC entry 3790 (class 2606 OID 59328)
-- Name: purchase_order_lines purchase_order_lines_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_lines
    ADD CONSTRAINT purchase_order_lines_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- TOC entry 3784 (class 2606 OID 59271)
-- Name: purchase_orders purchase_orders_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);


--
-- TOC entry 3785 (class 2606 OID 59276)
-- Name: purchase_orders purchase_orders_incoterm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_incoterm_id_fkey FOREIGN KEY (incoterm_id) REFERENCES public.incoterms(id);


--
-- TOC entry 3786 (class 2606 OID 59266)
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3787 (class 2606 OID 59281)
-- Name: purchase_orders purchase_orders_transport_mode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_transport_mode_id_fkey FOREIGN KEY (transport_mode_id) REFERENCES public.transport_modes(id);


--
-- TOC entry 3810 (class 2606 OID 59755)
-- Name: quotation_charge_lines quotation_charge_lines_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotation_charge_lines
    ADD CONSTRAINT quotation_charge_lines_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id);


--
-- TOC entry 3811 (class 2606 OID 59784)
-- Name: quotation_events quotation_events_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotation_events
    ADD CONSTRAINT quotation_events_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id);


--
-- TOC entry 3808 (class 2606 OID 59707)
-- Name: quotations quotations_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);


--
-- TOC entry 3809 (class 2606 OID 59702)
-- Name: quotations quotations_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3824 (class 2606 OID 73901)
-- Name: shipment_documents shipment_documents_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_documents
    ADD CONSTRAINT shipment_documents_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.shipment_milestones(id);


--
-- TOC entry 3825 (class 2606 OID 73896)
-- Name: shipment_documents shipment_documents_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_documents
    ADD CONSTRAINT shipment_documents_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);


--
-- TOC entry 3817 (class 2606 OID 73811)
-- Name: shipment_lines shipment_lines_delivery_order_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_lines
    ADD CONSTRAINT shipment_lines_delivery_order_line_id_fkey FOREIGN KEY (delivery_order_line_id) REFERENCES public.delivery_order_lines(id);


--
-- TOC entry 3818 (class 2606 OID 73816)
-- Name: shipment_lines shipment_lines_delivery_order_lot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_lines
    ADD CONSTRAINT shipment_lines_delivery_order_lot_id_fkey FOREIGN KEY (delivery_order_lot_id) REFERENCES public.delivery_order_lots(id);


--
-- TOC entry 3819 (class 2606 OID 73831)
-- Name: shipment_lines shipment_lines_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_lines
    ADD CONSTRAINT shipment_lines_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item_master(id);


--
-- TOC entry 3820 (class 2606 OID 73826)
-- Name: shipment_lines shipment_lines_po_lot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_lines
    ADD CONSTRAINT shipment_lines_po_lot_id_fkey FOREIGN KEY (po_lot_id) REFERENCES public.po_lots(id);


--
-- TOC entry 3821 (class 2606 OID 73821)
-- Name: shipment_lines shipment_lines_purchase_order_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_lines
    ADD CONSTRAINT shipment_lines_purchase_order_line_id_fkey FOREIGN KEY (purchase_order_line_id) REFERENCES public.purchase_order_lines(id);


--
-- TOC entry 3822 (class 2606 OID 73806)
-- Name: shipment_lines shipment_lines_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_lines
    ADD CONSTRAINT shipment_lines_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);


--
-- TOC entry 3823 (class 2606 OID 73865)
-- Name: shipment_milestones shipment_milestones_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_milestones
    ADD CONSTRAINT shipment_milestones_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);


--
-- TOC entry 3812 (class 2606 OID 73753)
-- Name: shipments shipments_delivery_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_delivery_order_id_fkey FOREIGN KEY (delivery_order_id) REFERENCES public.delivery_orders(id);


--
-- TOC entry 3813 (class 2606 OID 73763)
-- Name: shipments shipments_final_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_final_quotation_id_fkey FOREIGN KEY (final_quotation_id) REFERENCES public.quotations(id);


--
-- TOC entry 3814 (class 2606 OID 73773)
-- Name: shipments shipments_forwarder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_forwarder_id_fkey FOREIGN KEY (forwarder_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3815 (class 2606 OID 73758)
-- Name: shipments shipments_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- TOC entry 3816 (class 2606 OID 73768)
-- Name: shipments shipments_transport_mode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_transport_mode_id_fkey FOREIGN KEY (transport_mode_id) REFERENCES public.transport_modes(id);


--
-- TOC entry 3782 (class 2606 OID 59226)
-- Name: supplier_transport_modes supplier_transport_modes_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.supplier_transport_modes
    ADD CONSTRAINT supplier_transport_modes_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3783 (class 2606 OID 59231)
-- Name: supplier_transport_modes supplier_transport_modes_transport_mode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.supplier_transport_modes
    ADD CONSTRAINT supplier_transport_modes_transport_mode_id_fkey FOREIGN KEY (transport_mode_id) REFERENCES public.transport_modes(id);


--
-- TOC entry 3780 (class 2606 OID 59195)
-- Name: suppliers suppliers_default_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_default_currency_id_fkey FOREIGN KEY (default_currency_id) REFERENCES public.currencies(id);


--
-- TOC entry 3781 (class 2606 OID 59200)
-- Name: suppliers suppliers_default_incoterm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_default_incoterm_id_fkey FOREIGN KEY (default_incoterm_id) REFERENCES public.incoterms(id);


--
-- TOC entry 4031 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- TOC entry 2202 (class 826 OID 65537)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2201 (class 826 OID 65536)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2026-06-12 10:29:08

--
-- PostgreSQL database dump complete
--

\unrestrict ZLu7aDKePCZYNbTvcELnNYtmEuZsOrcVYIhUM6FTbEyfojSGH5W8A0ZXaGNuHje

