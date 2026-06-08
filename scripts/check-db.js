import { pool } from "../src/db/pool.js";

try {
    const connection = await pool.query(`
        SELECT
            current_database() AS database,
            current_user AS user_name,
            inet_server_addr() AS host,
            inet_server_port() AS port
    `);

    const tables = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('master_items', 'item_tax_profiles')
    `);
    const existingTables = tables.rows.map((row) => row.table_name);

    console.log(JSON.stringify({
        connected: true,
        ...connection.rows[0],
        masterItemsTableExists: existingTables.includes("master_items"),
        itemTaxProfilesTableExists: existingTables.includes("item_tax_profiles")
    }, null, 2));
} finally {
    await pool.end();
}
