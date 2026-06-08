import { pool } from "../src/db/pool.js";

try {
    const connection = await pool.query(`
        SELECT
            current_database() AS database,
            current_user AS user_name,
            inet_server_addr() AS host,
            inet_server_port() AS port
    `);

    const table = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'import_tax_lines'
    `);

    console.log(JSON.stringify({
        connected: true,
        ...connection.rows[0],
        importTaxLinesTableExists: table.rowCount > 0
    }, null, 2));
} finally {
    await pool.end();
}
