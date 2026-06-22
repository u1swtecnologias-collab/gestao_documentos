import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
p.account.findMany({ include: { user: true } }).then(a => {
  console.log(JSON.stringify(a, null, 2))
}).finally(async () => { await p.$disconnect() })
