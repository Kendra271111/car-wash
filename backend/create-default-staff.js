import { PrismaClient } from './.prisma/client/client.js'
const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRaw`
    INSERT INTO staff (id, name, email, "position", "isActive", "createdAt", "updatedAt")
    VALUES (1, 'Default Staff', 'staff@example.com', 'Staff', true, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `
  console.log('Created default staff record')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
