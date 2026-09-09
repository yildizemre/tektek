import type { Client, InValue } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

import { INDEX_STATEMENTS, MIGRATION_STATEMENTS, SCHEMA_STATEMENTS } from "./schema";
import { seedDatabase } from "./seed";

declare global {
  var __storeDb: Promise<Client> | undefined;
  var __storeSchemaVersion: number | undefined;
}

/** Bump when new tables/columns are added so a running `next dev` re-applies schema. */
const SCHEMA_VERSION = 4;

const DATA_DIR = path.join(process.cwd(), "data");

function shouldUseTurso() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) return false;
  if (process.env.USE_TURSO === "1") return true;
  return process.env.NODE_ENV === "production";
}

async function createDbClient(): Promise<Client> {
  if (shouldUseTurso()) {
    // The web build talks HTTP only, so serverless deploys need no native binary.
    const { createClient } = await import("@libsql/client/web");
    return createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
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
  if (globalThis.__storeSchemaVersion !== SCHEMA_VERSION) {
    globalThis.__storeDb = undefined;
    globalThis.__storeSchemaVersion = SCHEMA_VERSION;
  }

  globalThis.__storeDb ??= (async () => {
    const client = await createDbClient();

    if (typeof client.batch === "function") {
      await client.batch(
        SCHEMA_STATEMENTS.map((sql) => ({ sql })),
        "write",
      ).catch(async () => {
        for (const statement of SCHEMA_STATEMENTS) await client.execute(statement);
      });
    } else {
      for (const statement of SCHEMA_STATEMENTS) await client.execute(statement);
    }

    for (const statement of MIGRATION_STATEMENTS) {
      await client.execute(statement).catch(() => undefined);
    }
    for (const statement of INDEX_STATEMENTS) {
      await client.execute(statement).catch(() => undefined);
    }

    const populated = await client.execute("SELECT 1 AS ok FROM settings LIMIT 1").catch(() => null);
    if (!populated?.rows?.length) await seedDatabase(client);

    return client;
  })();

  return globalThis.__storeDb;
}

function asPlain<T>(rows: unknown[]): T[] {
  return JSON.parse(JSON.stringify(rows)) as T[];
}

export async function all<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  const client = await db();
  const result = await client.execute({ sql, args });
  return asPlain<T>(result.rows as unknown[]);
}

export async function one<T>(sql: string, args: InValue[] = []): Promise<T | null> {
  const rows = await all<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: InValue[] = []) {
  const client = await db();
  return client.execute({ sql, args });
}
