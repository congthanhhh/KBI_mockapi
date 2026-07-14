import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import type { DeliveryOrderV1 } from '@shared/api/deliveryOrders';
import type { PurchaseOrderV1 } from '@shared/api/purchaseOrders';
import type { ShipmentV1 } from '@shared/api/shipments';
import type { Supplier } from '@shared/api/tradeMasterData';

import { getSupplierTransitRows, type SupplierTransitInput } from '../supplierTransitSelectors';

// Fixed "now" so windows and overdue detection are deterministic.
const NOW = dayjs('2026-07-20');

function makeSupplier(id: string, name = id, country: string | null = 'CN'): Supplier {
  return { id, supplier_code: id.toUpperCase(), supplier_name: name, country } as Supplier;
}

function makePo(id: string, supplierId: string, dates: Partial<PurchaseOrderV1>): PurchaseOrderV1 {
  return { id, po_no: id.toUpperCase(), supplier_id: supplierId, create_at: '2026-07-01', ...dates } as PurchaseOrderV1;
}

function makeDo(id: string, poId: string): DeliveryOrderV1 {
  return { id, purchase_order_id: poId } as DeliveryOrderV1;
}

function makeShipment(partial: Partial<ShipmentV1> & Pick<ShipmentV1, 'id' | 'delivery_order_id'>): ShipmentV1 {
  return { shipment_no: partial.id.toUpperCase(), mode: 'SEA', status: 'IN_TRANSIT', ...partial } as ShipmentV1;
}

function buildInput(overrides: Partial<SupplierTransitInput> = {}): SupplierTransitInput {
  return { shipments: [], deliveryOrders: [], purchaseOrders: [], suppliers: [], timeRange: '6m', ...overrides };
}

describe('getSupplierTransitRows', () => {
  it('computes lead time, door-to-door, on-time-ship and delay from POs', () => {
    const input = buildInput({
      suppliers: [makeSupplier('sup_1')],
      purchaseOrders: [
        // on-time ship: lead 10, door 20, no delay
        makePo('po_a', 'sup_1', { confirmed_at: '2026-07-01', expected_etd: '2026-07-11', actual_etd: '2026-07-11', actual_warehouse_ata: '2026-07-21' }),
        // late ship by 3: lead 8, door 18
        makePo('po_b', 'sup_1', { confirmed_at: '2026-07-01', expected_etd: '2026-07-06', actual_etd: '2026-07-09', actual_warehouse_ata: '2026-07-19' }),
      ],
    });

    const [row] = getSupplierTransitRows(input, NOW);

    expect(row.poCount).toBe(2);
    expect(row.leadTimeAvg).toBe(9); // (10 + 8) / 2
    expect(row.doorToDoorAvg).toBe(19); // (20 + 18) / 2
    expect(row.onTimeShipRate).toBe(0.5);
    expect(row.shipDelayAvg).toBe(1.5); // (0 + 3) / 2
  });

  it('falls back to create_at when confirmed_at is missing', () => {
    const input = buildInput({
      suppliers: [makeSupplier('sup_1')],
      purchaseOrders: [makePo('po_a', 'sup_1', { create_at: '2026-07-01', expected_etd: '2026-07-06', actual_etd: '2026-07-06' })],
    });

    const [row] = getSupplierTransitRows(input, NOW);

    expect(row.leadTimeAvg).toBe(5);
  });

  it('excludes POs outside the selected window', () => {
    const input = buildInput({
      suppliers: [makeSupplier('sup_1')],
      timeRange: '7d',
      purchaseOrders: [
        makePo('old', 'sup_1', { confirmed_at: '2026-05-20', expected_etd: '2026-06-01', actual_etd: '2026-06-01' }),
        makePo('recent', 'sup_1', { confirmed_at: '2026-07-10', expected_etd: '2026-07-15', actual_etd: '2026-07-15' }),
      ],
    });

    const [row] = getSupplierTransitRows(input, NOW);

    expect(row.poCount).toBe(1);
    expect(row.leadTimeAvg).toBe(5); // only "recent"
  });

  it('derives shipment states, active and overdue counts for the drill-down', () => {
    const input = buildInput({
      suppliers: [makeSupplier('sup_1')],
      purchaseOrders: [makePo('po_1', 'sup_1', { confirmed_at: '2026-07-01', expected_etd: '2026-07-05', actual_etd: '2026-07-05' })],
      deliveryOrders: [makeDo('do_1', 'po_1')],
      shipments: [
        makeShipment({ id: 'arr_ontime', delivery_order_id: 'do_1', atd: '2026-07-02', eta: '2026-07-10', ata: '2026-07-10', status: 'DELIVERED' }),
        makeShipment({ id: 'arr_late', delivery_order_id: 'do_1', atd: '2026-07-02', eta: '2026-07-08', ata: '2026-07-12', status: 'DELIVERED' }),
        makeShipment({ id: 'overdue', delivery_order_id: 'do_1', atd: '2026-07-05', eta: '2026-07-15', status: 'IN_TRANSIT' }),
        makeShipment({ id: 'intransit', delivery_order_id: 'do_1', atd: '2026-07-18', eta: '2026-07-28', status: 'IN_TRANSIT' }),
        makeShipment({ id: 'pending', delivery_order_id: 'do_1', eta: '2026-08-01', status: 'BOOKING_CONFIRMED' }),
      ],
    });

    const [row] = getSupplierTransitRows(input, NOW);

    expect(row.activeCount).toBe(3); // overdue + intransit + pending (DELIVERED excluded)
    expect(row.lateCount).toBe(1); // only the overdue one
    const byId = Object.fromEntries(row.shipments.map((s) => [s.shipmentId, s.state]));
    expect(byId).toMatchObject({
      arr_ontime: 'ARRIVED_ONTIME',
      arr_late: 'ARRIVED_LATE',
      overdue: 'OVERDUE',
      intransit: 'IN_TRANSIT',
      pending: 'PENDING',
    });
    const overdue = row.shipments.find((s) => s.shipmentId === 'overdue');
    expect(overdue?.varianceDays).toBe(5); // 2026-07-20 - 2026-07-15
  });

  it('sorts suppliers with overdue shipments first', () => {
    const input = buildInput({
      suppliers: [makeSupplier('sup_ok', 'OK'), makeSupplier('sup_overdue', 'Overdue')],
      purchaseOrders: [
        makePo('po_ok', 'sup_ok', { confirmed_at: '2026-07-01', expected_etd: '2026-07-05', actual_etd: '2026-07-05' }),
        makePo('po_od', 'sup_overdue', { confirmed_at: '2026-07-01', expected_etd: '2026-07-05', actual_etd: '2026-07-05' }),
      ],
      deliveryOrders: [makeDo('do_ok', 'po_ok'), makeDo('do_od', 'po_od')],
      shipments: [
        makeShipment({ id: 'ok', delivery_order_id: 'do_ok', atd: '2026-07-18', eta: '2026-07-28', status: 'IN_TRANSIT' }),
        makeShipment({ id: 'od', delivery_order_id: 'do_od', atd: '2026-07-05', eta: '2026-07-12', status: 'IN_TRANSIT' }),
      ],
    });

    const rows = getSupplierTransitRows(input, NOW);

    expect(rows.map((r) => r.supplierId)).toEqual(['sup_overdue', 'sup_ok']);
  });
});
