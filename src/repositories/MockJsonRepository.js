import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const repositoryDir = path.dirname(fileURLToPath(import.meta.url));
const defaultDataDir = path.resolve(repositoryDir, "../../mock-data");

export class MockJsonRepository {
    constructor(dataDir = defaultDataDir) {
        this.dataDir = dataDir;
    }

    async readCollection(name) {
        const filePath = this.getFilePath(name);
        const raw = await fs.readFile(filePath, "utf8");
        return JSON.parse(raw);
    }

    async findAll(name, filter = {}) {
        const rows = await this.readCollection(name);
        return rows.filter((row) => {
            if (row.is_delete === true) {
                return false;
            }

            return Object.entries(filter).every(([key, value]) => String(row[key]) === String(value));
        });
    }

    async writeCollection(name, data) {
        const filePath = this.getFilePath(name);
        await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
        return data;
    }

    async findById(name, id) {
        const rows = await this.readCollection(name);
        return rows.find((row) => row.id === id && row.is_delete !== true) || null;
    }

    async insert(name, record) {
        const rows = await this.readCollection(name);
        const now = new Date().toISOString();
        const nextRecord = {
            create_at: now,
            update_at: now,
            delete_at: null,
            is_delete: false,
            ...record
        };
        rows.push(nextRecord);
        await this.writeCollection(name, rows);
        return nextRecord;
    }

    async update(name, id, patch) {
        const rows = await this.readCollection(name);
        const index = rows.findIndex((row) => row.id === id && row.is_delete !== true);

        if (index < 0) {
            return null;
        }

        rows[index] = {
            ...rows[index],
            ...patch,
            update_at: new Date().toISOString()
        };
        await this.writeCollection(name, rows);
        return rows[index];
    }

    async softDelete(name, id) {
        return this.update(name, id, {
            is_delete: true,
            delete_at: new Date().toISOString()
        });
    }

    async replaceAll(name, records) {
        return this.writeCollection(name, records);
    }

    async listCollectionNames() {
        const entries = await fs.readdir(this.dataDir, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
            .map((entry) => entry.name.replace(/\.json$/, ""))
            .sort();
    }

    getFilePath(name) {
        return path.join(this.dataDir, `${name}.json`);
    }
}

export const mockJsonRepository = new MockJsonRepository();
