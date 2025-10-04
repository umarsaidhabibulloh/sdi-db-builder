import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function ensureTablesExist() {
  console.log('🔍 Checking required tables...');

  // Create Role first (since User depends on it)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Role" (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserGroup" (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      id VARCHAR(255) PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      "roleId" INT,
      CONSTRAINT fk_role FOREIGN KEY("roleId") REFERENCES "Role"(id),
      "userGroupId" INT,
      CONSTRAINT fk_role FOREIGN KEY("userGroupId") REFERENCES "UserGroup"(id),
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "db_models" (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      schema TEXT NOT NULL,      
      definition JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);

  console.log('✅ Tables ensured: User, Role, UserGroup, db_models');
}
