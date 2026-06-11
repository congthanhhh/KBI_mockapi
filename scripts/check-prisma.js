import { prisma } from "../src/db/prisma.js";
import { listCurrencies } from "../src/modules/currencies/currencies.service.js";
import { listIncoterms } from "../src/modules/incoterms/incoterms.service.js";
import { listItemGroups } from "../src/modules/itemGroups/itemGroups.service.js";
import { listItems } from "../src/modules/items/items.service.js";
import { getOptions } from "../src/modules/options/options.service.js";
import { listSuppliers } from "../src/modules/suppliers/suppliers.service.js";
import { listTransportModes } from "../src/modules/transportModes/transportModes.service.js";

try {
    const [
        itemGroupCount,
        itemCount,
        profileCount,
        currencyCount,
        incotermCount,
        transportModeCount,
        supplierCount,
        supplierTransportModeCount
    ] = await Promise.all([
        prisma.itemGroup.count({ where: { is_delete: false } }),
        prisma.itemMaster.count({ where: { is_delete: false } }),
        prisma.itemCustomsProfile.count({ where: { is_delete: false } }),
        prisma.currency.count({ where: { is_delete: false } }),
        prisma.incoterm.count({ where: { is_delete: false } }),
        prisma.transportMode.count({ where: { is_delete: false } }),
        prisma.supplier.count({ where: { is_delete: false } }),
        prisma.supplierTransportMode.count({ where: { is_delete: false } })
    ]);
    const itemGroupsPage = await listItemGroups({ page: 1, limit: 5, offset: 0 });
    const itemsPage = await listItems({ page: 1, limit: 5, offset: 0 });
    const currenciesPage = await listCurrencies({ page: 1, limit: 5, offset: 0 });
    const incotermsPage = await listIncoterms({ page: 1, limit: 5, offset: 0 });
    const transportModesPage = await listTransportModes({ page: 1, limit: 5, offset: 0 });
    const suppliersPage = await listSuppliers({ page: 1, limit: 5, offset: 0 });
    const options = await getOptions({});

    console.log(JSON.stringify({
        prismaConnected: true,
        itemGroupCount,
        itemCount,
        profileCount,
        currencyCount,
        incotermCount,
        transportModeCount,
        supplierCount,
        supplierTransportModeCount,
        itemGroupsPage: {
            count: itemGroupsPage.data.length,
            pagination: itemGroupsPage.pagination
        },
        itemsPage: {
            count: itemsPage.data.length,
            pagination: itemsPage.pagination
        },
        currenciesPage: {
            count: currenciesPage.data.length,
            pagination: currenciesPage.pagination
        },
        incotermsPage: {
            count: incotermsPage.data.length,
            pagination: incotermsPage.pagination
        },
        transportModesPage: {
            count: transportModesPage.data.length,
            pagination: transportModesPage.pagination
        },
        suppliersPage: {
            count: suppliersPage.data.length,
            pagination: suppliersPage.pagination
        },
        options: Object.keys(options.data)
    }, null, 2));
} finally {
    await prisma.$disconnect();
}
