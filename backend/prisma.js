const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Load environment variables from root .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

module.exports = prisma;
