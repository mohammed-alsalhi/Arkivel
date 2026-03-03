import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// ---------------------------------------------------------------------------
// Read-replica Prisma client
//
// When DATABASE_REPLICA_URL is configured, a separate PrismaClient is created
// pointing at the read replica. This can be used in GET endpoints to offload
// reads from the primary database.
//
// When no replica URL is set the client falls back to the primary so callers
// don't need conditional logic.
// ---------------------------------------------------------------------------

const globalForReplica = globalThis as unknown as { prismaRead?: PrismaClient };

function createReplicaClient(): PrismaClient {
  const replicaUrl = process.env.DATABASE_REPLICA_URL;

  if (!replicaUrl) {
    // No replica configured — fall back to the primary client.
    // Using require() here avoids a circular-import at module evaluation time
    // because prisma.ts may transitively import this module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: prisma } = require("@/lib/prisma");
    return prisma as PrismaClient;
  }

  const pool = new pg.Pool({ connectionString: replicaUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/**
 * A PrismaClient that reads from the database replica when
 * `DATABASE_REPLICA_URL` is set, otherwise transparently falls back to the
 * primary database.
 */
export const prismaRead: PrismaClient =
  globalForReplica.prismaRead ?? createReplicaClient();

// Cache on globalThis in development to survive hot-reload without leaking
// connections.
if (process.env.NODE_ENV !== "production") {
  globalForReplica.prismaRead = prismaRead;
}
