import { prisma } from "../src/db/prisma.js";
import { listItemGroups } from "../src/modules/itemGroups/itemGroups.service.js";
import { listItems } from "../src/modules/items/items.service.js";

try {
    const [itemGroupCount, itemCount, profileCount] = await Promise.all([
        prisma.itemGroup.count({ where: { is_delete: false } }),
        prisma.itemMaster.count({ where: { is_delete: false } }),
        prisma.itemCustomsProfile.count({ where: { is_delete: false } })
    ]);
    const itemGroupsPage = await listItemGroups({ page: 1, limit: 5, offset: 0 });
    const itemsPage = await listItems({ page: 1, limit: 5, offset: 0 });

    console.log(JSON.stringify({
        prismaConnected: true,
        itemGroupCount,
        itemCount,
        profileCount,
        itemGroupsPage: {
            count: itemGroupsPage.data.length,
            pagination: itemGroupsPage.pagination
        },
        itemsPage: {
            count: itemsPage.data.length,
            pagination: itemsPage.pagination
        }
    }, null, 2));
} finally {
    await prisma.$disconnect();
}
