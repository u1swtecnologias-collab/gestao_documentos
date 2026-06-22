import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando renumeração de áreas...");

  const areas = await prisma.area.findMany({
    orderBy: { codigo: 'asc' }
  });

  let nextCodigo = 1;

  for (const area of areas) {
    const oldCodigo = area.codigo;
    const newCodigo = nextCodigo.toString().padStart(2, '0');

    if (oldCodigo !== newCodigo) {
      console.log(`Atualizando Área '${area.nome}': ${oldCodigo} -> ${newCodigo}`);
      
      // Update area codigo
      await prisma.area.update({
        where: { id: area.id },
        data: { codigo: newCodigo }
      });

      // Update processes that belong to this area (where areaPrincipalId = area.id)
      const processos = await prisma.processo.findMany({
        where: { areaPrincipalId: area.id }
      });

      for (const proc of processos) {
        // Formato esperado do numero do processo: AA.NNNNN-VV
        // Ex: 03.00001-01
        if (proc.numero.startsWith(`${oldCodigo}.`)) {
          const newNumero = proc.numero.replace(new RegExp(`^${oldCodigo}\\.`), `${newCodigo}.`);
          await prisma.processo.update({
            where: { id: proc.id },
            data: { numero: newNumero }
          });
          console.log(`  Processo atualizado: ${proc.numero} -> ${newNumero}`);
        }
      }
    }
    nextCodigo++;
  }

  console.log("Renumeração concluída com sucesso.");
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
