import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const adminProfile = await prisma.perfil.findUnique({ where: { nome: 'Administrador' } })
  if (adminProfile) {
    await prisma.user.updateMany({
      data: { perfilId: adminProfile.id }
    })
    console.log("Todos os usuários foram atualizados para Administrador!")
  } else {
    console.log("Perfil Administrador não encontrado.")
  }
}
main().finally(() => prisma.$disconnect())
