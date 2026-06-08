import dotenv from "dotenv";

dotenv.config({ override: true });

export const env = {
    port: process.env.PORT || 3001,
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    databaseUrl: process.env.DATABASE_URL,
    pgHost: process.env.PGHOST || "localhost",
    pgPort: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    pgDatabase: process.env.PGDATABASE,
    pgUser: process.env.PGUSER,
    pgPassword: process.env.PGPASSWORD,
    pgSsl: process.env.PGSSL === "true"
};
