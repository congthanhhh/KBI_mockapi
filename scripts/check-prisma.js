import { prisma } from "../src/db/prisma.js";
import { listItems } from "../src/modules/items/items.service.js";

try {
    const [itemCount, profileCount] = await Promise.all([
        prisma.masterItem.count({ where: { is_delete: false } }),
        prisma.itemTaxProfile.count({ where: { is_delete: false } })
    ]);
    const itemsPage = await listItems({ page: 1, limit: 5, offset: 0 });

    console.log(JSON.stringify({
        prismaConnected: true,
        itemCount,
        profileCount,
        itemsPage: {
            count: itemsPage.data.length,
            pagination: itemsPage.pagination
        }
    }, null, 2));
} finally {
    await prisma.$disconnect();
}
