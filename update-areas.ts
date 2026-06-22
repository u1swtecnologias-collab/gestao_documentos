import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Encontrar as áreas atuais
  const areaTI = await prisma.area.findFirst({ where: { nome: 'TI' } });
  const areaJuridico = await prisma.area.findFirst({ where: { nome: 'Jurídico' } });
  const areaFinanceiro = await prisma.area.findFirst({ where: { nome: 'Financeiro' } });

  // Atualizar códigos de área
  if (areaTI) await prisma.area.update({ where: { id: areaTI.id }, data: { codigo: '01' } });
  if (areaJuridico) await prisma.area.update({ where: { id: areaJuridico.id }, data: { codigo: '02' } });
  if (areaFinanceiro) await prisma.area.update({ where: { id: areaFinanceiro.id }, data: { codigo: '03' } });

  // Atualizar números de processos existentes
  const processos = await prisma.processo.findMany({ include: { areaPrincipal: true } });
  for (const proc of processos) {
    const area = await prisma.area.findUnique({ where: { id: proc.areaPrincipalId } });
    if (area && proc.numero.startsWith('03.')) {
      const newNumero = proc.numero.replace(/^03\./, '01.');
      await prisma.processo.update({
        where: { id: proc.id },
        data: { numero: newNumero }
      });
      console.log(`Updated process ${proc.numero} to ${newNumero}`);
    }
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
