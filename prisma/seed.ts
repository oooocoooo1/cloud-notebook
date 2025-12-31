import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const defaultNotebook = await prisma.notebook.upsert({
        where: { id: 'default' }, // Note: We need to change ID to String if we want fixed IDs, or query by name
        update: {},
        create: {
            name: '我的笔记本',
        },
    })

    // Since we use UUIDs by default in schema, we can't easily upsert by ID unless we know it.
    // But for 'default', we might want to find first.

    const count = await prisma.notebook.count();
    if (count === 0) {
        await prisma.notebook.create({
            data: {
                name: '我的笔记本',
                notes: {
                    create: {
                        title: '欢迎使用云笔记',
                        content: '您的云数据库已连接成功！数据将安全地存储在云端。'
                    }
                }
            }
        })
        console.log("Seeding complete: Created default notebook.");
    } else {
        console.log("Seeding skipped: Notebooks already exist.");
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
