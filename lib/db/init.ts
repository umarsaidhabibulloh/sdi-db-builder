import { PrismaClient } from '@prisma/client';

let prisma = new PrismaClient();
let initialized = false;

export async function ensureBaseTables() {
  if (initialized) return; // run only once per server start
  initialized = true;

  try {
    // Check if tables exist, if not, create them
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Role" (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserGroup" (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        roleId VARCHAR(255) NOT NULL REFERENCES "Role"(id),
        groupId VARCHAR(255) NOT NULL REFERENCES "UserGroup"(id),
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "db_models" (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        schema TEXT,      
        definition JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    console.log('✅ Base tables ensured.');
  } catch (error) {
    console.error('❌ Failed ensuring base tables:', error);
  }
}
