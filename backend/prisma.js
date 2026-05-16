const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'mysql://sipetut_db:Bangbens220488!@garudaserver.id:3306/sipetut_db'
});

module.exports = prisma;
