const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Load environment variables from root .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// In Prisma 6, it will automatically look for DATABASE_URL in process.env
// if the schema.prisma has url = env("DATABASE_URL")
const prisma = new PrismaClient();

module.exports = prisma;
