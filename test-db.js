const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting...');
        await prisma.$connect();
        console.log('Connected successfully!');

        console.log('Pushing schema...');
        // We can't push via client, but we can check if we can query
        // count
        try {
            const count = await prisma.notebook.count();
            console.log('Notebook count:', count);
        } catch (e) {
            console.log('Table likely does not exist yet (Expected if first run)');
        }

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
