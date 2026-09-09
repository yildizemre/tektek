import type { Client, InValue } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

import { SCHEMA_STATEMENTS } from "./schema";
import { seedDatabase } from "./seed";

declare global {
  var __storeDb: Promise<Client> | undefined;
}

const DATA_DIR = path.join(process.cwd(), "data");

async function createDbClient(): Promise<Client> {
  const tursoUrl = process.env.TURSO_DATABASE_URL;

  if (tursoUrl) {
    // The web build talks HTTP only, so serverless deploys need no native binary.
    const { createClient } = await import("@libsql/client/web");
    return createClient({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN });
  }

  const { createClient } = await import("@libsql/client");
  fs.mkdirSync(DATA_DIR, { recursive: true });

  return createClient({ url: `file:${path.join(DATA_DIR, "store.db")}` });
}

/**
 * Every query goes through here so a fresh clone (or a fresh Turso database)
 * gets its tables and demo content without a manual migration step.
 */
export async function db(): Promise<Client> {
  globalThis.__storeDb ??= (async () => {
    const client = await createDbClient();

    for (const statement of SCHEMA_STATEMENTS) {
      await client.execute(statement);
    }

    await seedDatabase(client);
    return client;
  })();

  return globalThis.__storeDb;
}

export async function all<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  const client = await db();
  const result = await client.execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function one<T>(sql: string, args: InValue[] = []): Promise<T | null> {
  const rows = await all<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: InValue[] = []) {
  const client = await db();
  return client.execute({ sql, args });
}
