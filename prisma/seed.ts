import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Parametros
  const parametros = [
    { chave: 'PASTA_RAIZ_DRIVE', valor: '00-PASTA-RAIZ-PROCESSOS' },
    { chave: 'MASCARA_NUMERO', valor: 'AA.NNNNN-VV' },
  ]
  for (const p of parametros) {
    await prisma.parametro.upsert({
      where: { chave: p.chave },
      update: {},
      create: p,
    })
  }

  // Areas
  const areas = [
    { codigo: '01', nome: 'TI' },
    { codigo: '02', nome: 'Jurídico' },
    { codigo: '03', nome: 'Financeiro' },
  ]
  for (const a of areas) {
    await prisma.area.upsert({
      where: { codigo: a.codigo },
      update: {},
      create: a,
    })
  }

  // Tipos de Documento
  const tipos = ['Minuta', 'Contrato', 'Proposta', 'Ata', 'Relatório']
  for (const t of tipos) {
    await prisma.tipoDocumento.upsert({
      where: { nome: t },
      update: {},
      create: { nome: t },
    })
  }

  // Perfis
  const perfis = ['Administrador', 'Gestor', 'Colaborador', 'Consulta']
  for (const p of perfis) {
    await prisma.perfil.upsert({
      where: { nome: p },
      update: {},
      create: { nome: p },
    })
  }

  // Status do Processo
  const status = ['Aberto', 'Em andamento', 'Concluído', 'Cancelado']
  for (const s of status) {
    await prisma.statusProcesso.upsert({
      where: { nome: s },
      update: {},
      create: { nome: s },
    })
  }

  console.log('Seeding finished.')
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
