const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
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
            console.log("Seeding complete.");
        } else {
            console.log("Seeding skipped.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
