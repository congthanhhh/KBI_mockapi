import fs from "node:fs/promises";
import { pool } from "../src/db/pool.js";

try {
    const schema = await fs.readFile(new URL("../sql/schema.sql", import.meta.url), "utf8");
    await pool.query(schema);

    console.log("Database schema initialized.");
} finally {
    await pool.end();
}
