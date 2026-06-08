import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

const ssl = env.pgSsl ? { rejectUnauthorized: false } : false;

const poolConfig = env.databaseUrl
    ? {
        connectionString: env.databaseUrl,
        ssl
    }
    : {
        host: env.pgHost,
        port: env.pgPort,
        database: env.pgDatabase,
        user: env.pgUser,
        password: env.pgPassword,
        ssl
    };

export const pool = new Pool(poolConfig);

export async function query(text, params) {
    return pool.query(text, params);
}
