import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

const adapterConfig = {
    connectionString: env.databaseUrl
};

if (env.pgSsl) {
    adapterConfig.ssl = { rejectUnauthorized: false };
}

const adapter = new PrismaPg(adapterConfig);

export const prisma = new PrismaClient({ adapter });
