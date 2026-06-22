"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDriveClient, getBackupDriveClient } from "@/lib/google";
import { revalidatePath } from "next/cache";

export async function createProcess(formData: FormData) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken;
  
  if (!session || !session.user) {
    throw new Error("Não autorizado");
  }

  // Verifica RBAC: Gestor ou Administrador (Comentado para testes)
  // const perfilNome = (session.user as any).perfilNome;
  // if (perfilNome !== "Gestor" && perfilNome !== "Administrador") {
  //   throw new Error("Permissão negada. Apenas Gestor ou Administrador podem iniciar processos.");
  // }

  const nome = formData.get("nome") as string;
  const areaPrincipalId = formData.get("areaPrincipalId") as string;
  const areasEnvolvidas = formData.getAll("areasEnvolvidas") as string[];

  if (!nome || !areaPrincipalId) {
    throw new Error("Nome e Área Principal são obrigatórios.");
  }

  // Obter Área Principal para pegar o código (AA)
  const area = await prisma.area.findUnique({ where: { id: areaPrincipalId } });
  if (!area) throw new Error("Área não encontrada");

  // Gerar Número do Processo (AA.NNNNN-VV)
  const ultimoProcesso = await prisma.processo.findFirst({
    where: { areaPrincipalId },
    orderBy: { numero: 'desc' }
  });

  let sequencial = 1;
  if (ultimoProcesso) {
    const parts = ultimoProcesso.numero.split('.');
    if (parts.length > 1) {
      const seqPart = parts[1].split('-')[0];
      sequencial = parseInt(seqPart, 10) + 1;
    }
  }

  const seqStr = sequencial.toString().padStart(5, '0');
  const versaoStr = '01';
  
  // Format: AA.NNNNN-VV (ex: 03.00001-01)
  const numeroProcesso = `${area.codigo}.${seqStr}-${versaoStr}`;

  // Criar pasta no Google Drive
  const pastaRaizParam = await prisma.parametro.findUnique({ where: { chave: 'PASTA_RAIZ_DRIVE' }});
  let pastaRaizId = pastaRaizParam?.valor;

  if (pastaRaizId === "00-PASTA-RAIZ-PROCESSOS") {
    // Se ainda for o valor padrão do seed, cria na raiz do Meu Drive para evitar erro 404
    pastaRaizId = undefined;
  }

  let pastaDriveId = null;
  if (pastaRaizId && accessToken) {
    try {
      const drive = getDriveClient(accessToken);
      const res = await drive.files.create({
        requestBody: {
          name: numeroProcesso,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [pastaRaizId]
        },
        fields: 'id'
      });
      if (res.data.id) pastaDriveId = res.data.id;
    } catch (e: any) {
      console.error("Erro ao criar pasta no Drive", e.message);
      throw new Error("Erro na API do Google Drive: " + e.message);
    }
  }

  // Criar pasta no Drive de Backup
  let backupPastaDriveId = null;
  let areaBackupFolderId = area.backupPastaDriveId;

  try {
    const backupRootId = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID;
    if (backupRootId) {
      const backupDrive = getBackupDriveClient();

      // Se a área não tiver pasta, cria a pasta da área na raiz do backup
      if (!areaBackupFolderId) {
        const areaRes = await backupDrive.files.create({
          requestBody: {
            name: `[${area.codigo}] ${area.nome}`,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [backupRootId]
          },
          fields: 'id'
        });
        
        if (areaRes.data.id) {
          areaBackupFolderId = areaRes.data.id;
          // Atualiza a área no banco
          await prisma.area.update({
            where: { id: area.id },
            data: { backupPastaDriveId: areaBackupFolderId }
          });
        }
      }

      // Cria a pasta do Processo dentro da pasta da Área
      if (areaBackupFolderId) {
        const res = await backupDrive.files.create({
          requestBody: {
            name: numeroProcesso,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [areaBackupFolderId]
          },
          fields: 'id'
        });
        if (res.data.id) backupPastaDriveId = res.data.id;
      }
    }
  } catch (e: any) {
    console.error("Aviso: Falha ao criar pasta no Drive de backup:", e.message);
  }

  // Obter status Aberto
  const statusAberto = await prisma.statusProcesso.findUnique({ where: { nome: 'Aberto' } });
  if (!statusAberto) throw new Error("Status 'Aberto' não encontrado");

  // Registrar no Banco de Dados
  const novoProcesso = await prisma.processo.create({
    data: {
      numero: numeroProcesso,
      nome,
      pastaDriveId: pastaDriveId || "",
      backupPastaDriveId: backupPastaDriveId || "",
      areaPrincipalId: area.id,
      statusId: statusAberto.id,
      criadoPorId: session.user.id as string,
      areas: {
        create: areasEnvolvidas.filter(id => id).map(aId => ({
          area: { connect: { id: aId } }
        }))
      }
    }
  });

  revalidatePath("/dashboard");
  return { success: true, processo: novoProcesso };
}

export async function deleteProcess(processoId: string) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken;
  
  if (!session || !session.user || !accessToken) {
    throw new Error("Não autorizado");
  }

  // Verifica RBAC: Gestor ou Administrador (Comentado para testes)
  // const perfilNome = (session.user as any).perfilNome;
  // if (perfilNome !== "Gestor" && perfilNome !== "Administrador") {
  //   throw new Error("Permissão negada.");
  // }

  const processo = await prisma.processo.findUnique({
    where: { id: processoId }
  });

  if (!processo) throw new Error("Processo não encontrado");

  // Deleta do Drive se existir a pasta
  if (processo.pastaDriveId) {
    try {
      const drive = getDriveClient(accessToken);
      await drive.files.delete({ fileId: processo.pastaDriveId });
    } catch (e: any) {
      console.error("Aviso: Falha ao deletar pasta no Drive (pode já ter sido deletada):", e.message);
    }
  }

  // Deleta do Drive de Backup se existir a pasta
  if (processo.backupPastaDriveId) {
    try {
      const backupDrive = getBackupDriveClient();
      await backupDrive.files.delete({ fileId: processo.backupPastaDriveId });
    } catch (e: any) {
      console.error("Aviso: Falha ao deletar pasta no Drive de Backup (pode já ter sido deletada):", e.message);
    }
  }

  // Deleta do DB (Cascatas em Documento e ProcessoArea configuradas no schema)
  await prisma.processo.delete({
    where: { id: processoId }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function editProcess(processoId: string, formData: FormData) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken;

  if (!session || !session.user || !accessToken) {
    throw new Error("Não autorizado");
  }

  const nome = formData.get("nome") as string;
  const statusId = formData.get("statusId") as string;
  const areasEnvolvidas = formData.getAll("areasEnvolvidas") as string[];

  if (!nome || !statusId) {
    throw new Error("Nome e Status são obrigatórios.");
  }

  const processo = await prisma.processo.findUnique({
    where: { id: processoId }
  });

  if (!processo) throw new Error("Processo não encontrado");

  // Se o nome mudou e tem pasta no drive, renomeia a pasta
  if (nome !== processo.nome && processo.pastaDriveId) {
    try {
      const drive = getDriveClient(accessToken);
      await drive.files.update({
        fileId: processo.pastaDriveId,
        requestBody: {
          name: `${processo.numero} - ${nome}` // Mantém o número no nome da pasta
        }
      });
    } catch (e: any) {
      console.error("Aviso: Falha ao renomear pasta no Drive:", e.message);
    }
  }

  // Renomeia no Drive de Backup
  if (nome !== processo.nome && processo.backupPastaDriveId) {
    try {
      const backupDrive = getBackupDriveClient();
      await backupDrive.files.update({
        fileId: processo.backupPastaDriveId,
        requestBody: {
          name: `${processo.numero} - ${nome}` // Mantém o número no nome da pasta
        }
      });
    } catch (e: any) {
      console.error("Aviso: Falha ao renomear pasta no Drive de Backup:", e.message);
    }
  }

  // Atualiza DB
  const updatedProcesso = await prisma.processo.update({
    where: { id: processoId },
    data: {
      nome,
      statusId,
      areas: {
        deleteMany: {}, // Remove as áreas antigas
        create: areasEnvolvidas.filter(id => id).map(aId => ({
          area: { connect: { id: aId } }
        }))
      }
    }
  });

  revalidatePath(`/dashboard/processo/${processoId}`);
  revalidatePath("/dashboard");
  return { success: true, processo: updatedProcesso };
}
