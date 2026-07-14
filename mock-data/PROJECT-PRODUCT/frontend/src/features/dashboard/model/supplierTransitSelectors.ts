import dayjs from 'dayjs';

import type { DeliveryOrderV1 } from '@shared/api/deliveryOrders';
import type { PurchaseOrderV1 } from '@shared/api/purchaseOrders';
import type { ShipmentV1 } from '@shared/api/shipments';
import type { Supplier } from '@shared/api/tradeMasterData';

export type DashboardTimeRange = '7d' | '30d' | '6m';

/** Per-shipment (lô hàng) detail shown when a supplier row is expanded. */
export type SupplierShipmentDetail = {
  shipmentId: string;
  shipmentNo: string;
  mode: string | null;
  pol: string | null;
  pod: string | null;
  eta: string | null;
  status: string;
  /** Port-to-port actual transit (ata - atd) in days, null until both are set. */
  transitDays: number | null;
  /** Positive = late. Arrived: ata - eta. In transit past ETA: today - eta. Else null. */
  varianceDays: number | null;
  state: 'ARRIVED_ONTIME' | 'ARRIVED_LATE' | 'IN_TRANSIT' | 'OVERDUE' | 'PENDING';
};

/**
 * One aggregated leaderboard row per supplier. Headline metrics are PO-centric
 * (attributable to the supplier); the shipment list powers the drill-down that
 * explains *why* the numbers look the way they do.
 *
 * - Lead time  = supplier PO handling: `actual_etd - (confirmed_at ?? create_at)`
 * - Door-to-door = full cycle: `actual_warehouse_ata - (confirmed_at ?? create_at)`
 * - On-time (ship) = share of POs where `actual_etd <= expected_etd`
 */
export type SupplierTransitRow = {
  supplierId: string;
  supplierName: string;
  country: string | null;
  poCount: number;
  /** Mean supplier lead time (PO confirmed -> ETD) in days. */
  leadTimeAvg: number | null;
  /** Mean planned lead time (PO confirmed -> expected ETD) — baseline for the delta. */
  leadTimePlannedAvg: number | null;
  /** Mean door-to-door cycle (PO confirmed -> warehouse arrival) in days. */
  doorToDoorAvg: number | null;
  /** Share of POs shipped on/before the promised ETD, 0..1 (null when none comparable). */
  onTimeShipRate: number | null;
  /** Mean ship delay in days across POs (>= 0, null when none comparable). */
  shipDelayAvg: number | null;
  /** Shipments still moving (status not DELIVERED/CANCELLED). */
  activeCount: number;
  /** Active shipments already past their ETA (currently overdue). */
  lateCount: number;
  /** Distinct transport modes across the supplier's shipments. */
  modes: string[];
  /** Per-shipment detail for the expandable drill-down, most recent ETA first. */
  shipments: SupplierShipmentDetail[];
};

export type SupplierTransitInput = {
  shipments: ShipmentV1[];
  deliveryOrders: DeliveryOrderV1[];
  purchaseOrders: PurchaseOrderV1[];
  suppliers: Supplier[];
  timeRange: DashboardTimeRange;
};

const CLOSED_SHIPMENT_STATUSES = new Set(['DELIVERED', 'CANCELLED']);

function windowStart(timeRange: DashboardTimeRange, now: dayjs.Dayjs) {
  switch (timeRange) {
    case '7d':
      return now.subtract(7, 'day');
    case '30d':
      return now.subtract(30, 'day');
    case '6m':
    default:
      return now.subtract(6, 'month');
  }
}

function notDeleted<T extends { is_delete?: boolean }>(record: T) {
  return !record.is_delete;
}

/** Days between two dates, `later - earlier`. Null when either is missing/invalid. */
function diffDays(later: string | null | undefined, earlier: string | null | undefined): number | null {
  if (!later || !earlier) return null;
  const a = dayjs(later);
  const b = dayjs(earlier);
  if (!a.isValid() || !b.isValid()) return null;
  return a.diff(b, 'day');
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((acc, value) => acc + value, 0) / values.length) * 10) / 10;
}

function inWindow(date: string | null | undefined, start: dayjs.Dayjs): boolean {
  if (!date) return false;
  const parsed = dayjs(date);
  return parsed.isValid() && !parsed.isBefore(start);
}

/** When did the supplier start the clock on this PO. */
function poStart(po: PurchaseOrderV1): string | null {
  return po.confirmed_at ?? po.create_at ?? null;
}

/** Reference date used to decide whether a PO falls inside the window. */
function poActivityDate(po: PurchaseOrderV1): string | null {
  return po.actual_etd ?? po.expected_etd ?? po.create_at ?? null;
}

function shipmentState(shipment: ShipmentV1, now: dayjs.Dayjs): SupplierShipmentDetail['state'] {
  if (shipment.ata) {
    const variance = diffDays(shipment.ata, shipment.eta);
    return variance != null && variance > 0 ? 'ARRIVED_LATE' : 'ARRIVED_ONTIME';
  }
  if (!shipment.atd) return 'PENDING';
  if (shipment.eta && now.isAfter(dayjs(shipment.eta))) return 'OVERDUE';
  return 'IN_TRANSIT';
}

function toShipmentDetail(shipment: ShipmentV1, now: dayjs.Dayjs): SupplierShipmentDetail {
  const state = shipmentState(shipment, now);
  const varianceDays =
    shipment.ata != null
      ? diffDays(shipment.ata, shipment.eta)
      : state === 'OVERDUE'
        ? diffDays(now.format('YYYY-MM-DD'), shipment.eta)
        : null;
  return {
    shipmentId: shipment.id,
    shipmentNo: shipment.shipment_no,
    mode: shipment.mode ?? null,
    pol: shipment.pol,
    pod: shipment.pod,
    eta: shipment.eta,
    status: shipment.status,
    transitDays: diffDays(shipment.ata, shipment.atd),
    varianceDays,
    state,
  };
}

/**
 * Build the supplier leaderboard. A supplier is in scope when it has at least one
 * purchase order whose activity date falls inside the selected window.
 */
export function getSupplierTransitRows(input: SupplierTransitInput, now = dayjs()): SupplierTransitRow[] {
  const { shipments, deliveryOrders, purchaseOrders, suppliers, timeRange } = input;
  const start = windowStart(timeRange, now);

  const suppliersById = new Map(suppliers.filter(notDeleted).map((s) => [s.id, s]));
  const poById = new Map(purchaseOrders.filter(notDeleted).map((po) => [po.id, po]));
  const doById = new Map(deliveryOrders.filter(notDeleted).map((d) => [d.id, d]));

  // 1) In-window POs grouped by supplier.
  const posBySupplier = new Map<string, PurchaseOrderV1[]>();
  const inWindowPoIds = new Set<string>();
  purchaseOrders.filter(notDeleted).forEach((po) => {
    if (!inWindow(poActivityDate(po), start)) return;
    inWindowPoIds.add(po.id);
    posBySupplier.set(po.supplier_id, [...(posBySupplier.get(po.supplier_id) ?? []), po]);
  });

  // 2) Shipments grouped by supplier (only those under an in-window PO).
  const shipmentsBySupplier = new Map<string, ShipmentV1[]>();
  shipments.filter(notDeleted).forEach((shipment) => {
    const deliveryOrder = doById.get(shipment.delivery_order_id);
    if (!deliveryOrder) return;
    const po = poById.get(deliveryOrder.purchase_order_id);
    if (!po || !inWindowPoIds.has(po.id)) return;
    shipmentsBySupplier.set(po.supplier_id, [...(shipmentsBySupplier.get(po.supplier_id) ?? []), shipment]);
  });

  const rows: SupplierTransitRow[] = [];
  posBySupplier.forEach((pos, supplierId) => {
    const supplier = suppliersById.get(supplierId);
    if (!supplier) return;

    const leadTimes = pos.map((po) => diffDays(po.actual_etd, poStart(po))).filter((v): v is number => v != null && v >= 0);
    const leadPlanned = pos.map((po) => diffDays(po.expected_etd, poStart(po))).filter((v): v is number => v != null && v >= 0);
    const doorToDoor = pos
      .map((po) => diffDays(po.actual_warehouse_ata, poStart(po)))
      .filter((v): v is number => v != null && v >= 0);

    const shipComparable = pos.filter((po) => po.actual_etd && po.expected_etd);
    const onTimeShip = shipComparable.filter((po) => diffDays(po.actual_etd, po.expected_etd)! <= 0).length;
    const shipDelays = shipComparable
      .map((po) => Math.max(0, diffDays(po.actual_etd, po.expected_etd) ?? 0));

    const supplierShipments = shipmentsBySupplier.get(supplierId) ?? [];
    const details = supplierShipments
      .map((shipment) => toShipmentDetail(shipment, now))
      .sort((a, b) => (b.eta ?? '').localeCompare(a.eta ?? ''));

    rows.push({
      supplierId,
      supplierName: supplier.supplier_name,
      country: supplier.country ?? null,
      poCount: pos.length,
      leadTimeAvg: mean(leadTimes),
      leadTimePlannedAvg: mean(leadPlanned),
      doorToDoorAvg: mean(doorToDoor),
      onTimeShipRate: shipComparable.length > 0 ? onTimeShip / shipComparable.length : null,
      shipDelayAvg: mean(shipDelays),
      activeCount: supplierShipments.filter((s) => !CLOSED_SHIPMENT_STATUSES.has(s.status)).length,
      lateCount: details.filter((d) => d.state === 'OVERDUE').length,
      modes: [...new Set(supplierShipments.map((s) => s.mode).filter((m): m is string => Boolean(m)))],
      shipments: details,
    });
  });

  return rows.sort(compareSupplierRows);
}

/** Worst-first: currently-overdue up top, then low on-time-ship, then most active. */
function compareSupplierRows(a: SupplierTransitRow, b: SupplierTransitRow): number {
  if (a.lateCount !== b.lateCount) return b.lateCount - a.lateCount;
  const onTimeA = a.onTimeShipRate ?? Number.POSITIVE_INFINITY; // nulls sink to the bottom
  const onTimeB = b.onTimeShipRate ?? Number.POSITIVE_INFINITY;
  if (onTimeA !== onTimeB) return onTimeA - onTimeB;
  return b.activeCount - a.activeCount;
}
