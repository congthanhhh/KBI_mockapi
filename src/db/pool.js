import dotenv from "dotenv";
import pg from "pg";

const { Pool } = pg;

dotenv.config({ override: true });

const ssl = process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false;

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl
    }
    : {
        host: process.env.PGHOST || "localhost",
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl
    };

export const pool = new Pool(poolConfig);

export async function query(text, params) {
    return pool.query(text, params);
}
