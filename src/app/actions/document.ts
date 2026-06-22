"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDriveClient, getBackupDriveClient } from "@/lib/google";
import { revalidatePath } from "next/cache";

// Converte File (Web API) para Node.js Readable Stream
function fileToStream(file: File) {
  const { Readable } = require('stream');
  return Readable.fromWeb(file.stream() as any);
}

export async function uploadFile(formData: FormData) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken;
  
  if (!session || !session.user || !accessToken) {
    throw new Error("Não autorizado");
  }

  const perfilNome = (session.user as any).perfilNome;
  if (perfilNome === "Consulta") {
    throw new Error("Permissão negada. Perfil de Consulta não pode inserir arquivos.");
  }

  const processoId = formData.get("processoId") as string;
  const tipoId = formData.get("tipoId") as string;
  const descricao = formData.get("descricao") as string;
  const comentario = formData.get("comentario") as string;
  const file = formData.get("file") as File;

  if (!processoId || !tipoId || !descricao || !file || file.size === 0) {
    throw new Error("Dados incompletos.");
  }

  const processo = await prisma.processo.findUnique({ 
    where: { id: processoId },
    include: { areaPrincipal: true }
  });
  if (!processo) throw new Error("Processo não encontrado");

  const tipo = await prisma.tipoDocumento.findUnique({ where: { id: tipoId } });
  if (!tipo) throw new Error("Tipo de documento não encontrado");

  // Nomenclatura Padronizada
  const fileName = `[Processo ${processo.numero}] - [${tipo.nome}] - ${file.name}`;

  // Prepara o buffer para enviar duas vezes (Stream normal é consumida na 1ª vez)
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const { Readable } = require('stream');

  // Upload para o Google Drive do usuário logado
  let driveFileId = "";
  try {
    const drive = getDriveClient(accessToken);
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: processo.pastaDriveId ? [processo.pastaDriveId] : undefined
      },
      media: {
        mimeType: file.type,
        body: Readable.from(fileBuffer)
      },
      fields: 'id'
    });
    
    if (res.data.id) driveFileId = res.data.id;
  } catch (e: any) {
    throw new Error("Erro no upload para o Drive do Usuário: " + e.message);
  }

  // Upload para o Drive de Backup da Fundação
  try {
    const rootBackupFolderId = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID;
    if (rootBackupFolderId) {
      const backupDrive = getBackupDriveClient();
      let targetBackupFolderId = processo.backupPastaDriveId;
      
      // Criar a pasta retroativamente se não existir
      if (!targetBackupFolderId) {
        let areaBackupFolderId = processo.areaPrincipal.backupPastaDriveId;
        
        // 1. Criar pasta da Área se não existir
        if (!areaBackupFolderId) {
          const areaRes = await backupDrive.files.create({
            requestBody: {
              name: `[${processo.areaPrincipal.codigo}] ${processo.areaPrincipal.nome}`,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [rootBackupFolderId]
            },
            fields: 'id'
          });
          if (areaRes.data.id) {
            areaBackupFolderId = areaRes.data.id;
            await prisma.area.update({
              where: { id: processo.areaPrincipal.id },
              data: { backupPastaDriveId: areaBackupFolderId }
            });
          }
        }
        
        const parentForProcess = areaBackupFolderId || rootBackupFolderId;

        // 2. Criar pasta do Processo
        const resFolder = await backupDrive.files.create({
          requestBody: {
            name: processo.numero,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentForProcess]
          },
          fields: 'id'
        });
        if (resFolder.data.id) {
          targetBackupFolderId = resFolder.data.id;
          await prisma.processo.update({
            where: { id: processo.id },
            data: { backupPastaDriveId: targetBackupFolderId }
          });
        }
      }

      const parentToUse = targetBackupFolderId || rootBackupFolderId;

      await backupDrive.files.create({
        requestBody: {
          name: fileName,
          parents: [parentToUse]
        },
        media: {
          mimeType: file.type,
          body: Readable.from(fileBuffer)
        },
        fields: 'id'
      });
    }
  } catch (e: any) {
    console.error("Aviso: Falha ao enviar para o Drive de backup:", e.message);
  }

  // Registrar no Banco de Dados
  await prisma.documento.create({
    data: {
      nome: fileName,
      descricao,
      comentario,
      driveFileId,
      driveTipo: 'arquivo',
      processoId: processo.id,
      tipoId,
      criadoPorId: session.user.id as string
    }
  });

  revalidatePath(`/dashboard/processo/${processo.id}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

export async function createGDoc(formData: FormData) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken;
  
  if (!session || !session.user || !accessToken) {
    throw new Error("Não autorizado");
  }

  const perfilNome = (session.user as any).perfilNome;
  if (perfilNome === "Consulta") {
    throw new Error("Permissão negada. Perfil de Consulta não pode criar documentos.");
  }

  const processoId = formData.get("processoId") as string;
  const tipoId = formData.get("tipoId") as string;
  const nome = formData.get("nome") as string;
  const descricao = formData.get("descricao") as string;

  if (!processoId || !tipoId || !nome || !descricao) {
    throw new Error("Dados incompletos.");
  }

  const processo = await prisma.processo.findUnique({ 
    where: { id: processoId },
    include: { areaPrincipal: true }
  });
  if (!processo) throw new Error("Processo não encontrado");

  const tipo = await prisma.tipoDocumento.findUnique({ where: { id: tipoId } });
  if (!tipo) throw new Error("Tipo de documento não encontrado");

  // Nomenclatura Padronizada
  const fileName = `[Processo ${processo.numero}] - [${tipo.nome}] - ${nome}`;

  let driveFileId = "";
  try {
    const drive = getDriveClient(accessToken);
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/vnd.google-apps.document',
        parents: processo.pastaDriveId ? [processo.pastaDriveId] : undefined
      },
      fields: 'id'
    });
    
    if (res.data.id) driveFileId = res.data.id;
  } catch (e: any) {
    throw new Error("Erro ao criar GDoc no Drive: " + e.message);
  }

  // Atalho de Backup
  try {
    const rootBackupFolderId = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID;
    if (rootBackupFolderId && driveFileId) {
      const backupDrive = getBackupDriveClient();
      let targetBackupFolderId = processo.backupPastaDriveId;
      
      // Criar a pasta retroativamente se não existir
      if (!targetBackupFolderId) {
        let areaBackupFolderId = processo.areaPrincipal.backupPastaDriveId;
        
        // 1. Criar pasta da Área se não existir
        if (!areaBackupFolderId) {
          const areaRes = await backupDrive.files.create({
            requestBody: {
              name: `[${processo.areaPrincipal.codigo}] ${processo.areaPrincipal.nome}`,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [rootBackupFolderId]
            },
            fields: 'id'
          });
          if (areaRes.data.id) {
            areaBackupFolderId = areaRes.data.id;
            await prisma.area.update({
              where: { id: processo.areaPrincipal.id },
              data: { backupPastaDriveId: areaBackupFolderId }
            });
          }
        }
        
        const parentForProcess = areaBackupFolderId || rootBackupFolderId;

        // 2. Criar pasta do Processo
        const resFolder = await backupDrive.files.create({
          requestBody: {
            name: processo.numero,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentForProcess]
          },
          fields: 'id'
        });
        if (resFolder.data.id) {
          targetBackupFolderId = resFolder.data.id;
          await prisma.processo.update({
            where: { id: processo.id },
            data: { backupPastaDriveId: targetBackupFolderId }
          });
        }
      }

      const parentToUse = targetBackupFolderId || rootBackupFolderId;

      await backupDrive.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'application/vnd.google-apps.shortcut',
          shortcutDetails: { targetId: driveFileId },
          parents: [parentToUse]
        },
        fields: 'id'
      });
    }
  } catch (e: any) {
    console.error("Aviso: Falha ao criar atalho no Drive de backup:", e.message);
  }

  await prisma.documento.create({
    data: {
      nome: fileName,
      descricao,
      comentario: "",
      driveFileId,
      driveTipo: 'gdoc',
      processoId: processo.id,
      tipoId,
      criadoPorId: session.user.id as string
    }
  });

  revalidatePath(`/dashboard/processo/${processo.id}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

export async function deleteDocument(documentoId: string) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken;

  if (!session || !session.user || !accessToken) {
    throw new Error("Não autorizado");
  }

  const documento = await prisma.documento.findUnique({
    where: { id: documentoId }
  });

  if (!documento) throw new Error("Documento não encontrado");

  // Deleta do Drive
  if (documento.driveFileId) {
    try {
      const drive = getDriveClient(accessToken);
      await drive.files.delete({ fileId: documento.driveFileId });
    } catch (e: any) {
      console.error("Aviso: Falha ao deletar arquivo no Drive (pode já ter sido deletado):", e.message);
    }
  }

  // Deleta do DB
  await prisma.documento.delete({
    where: { id: documentoId }
  });

  revalidatePath(`/dashboard/processo/${documento.processoId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function editDocument(documentoId: string, formData: FormData) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken;

  if (!session || !session.user || !accessToken) {
    throw new Error("Não autorizado");
  }

  const nome = formData.get("nome") as string;
  const descricao = formData.get("descricao") as string;
  const tipoId = formData.get("tipoId") as string;

  if (!nome || !descricao || !tipoId) {
    throw new Error("Dados incompletos.");
  }

  const documento = await prisma.documento.findUnique({
    where: { id: documentoId }
  });

  if (!documento) throw new Error("Documento não encontrado");

  // Renomeia no Drive
  if (nome !== documento.nome && documento.driveFileId) {
    try {
      const drive = getDriveClient(accessToken);
      await drive.files.update({
        fileId: documento.driveFileId,
        requestBody: {
          name: nome
        }
      });
    } catch (e: any) {
      console.error("Aviso: Falha ao renomear arquivo no Drive:", e.message);
    }
  }

  // Atualiza DB
  const updatedDocumento = await prisma.documento.update({
    where: { id: documentoId },
    data: {
      nome,
      descricao,
      tipoId
    }
  });

  revalidatePath(`/dashboard/processo/${documento.processoId}`);
  revalidatePath("/dashboard");
  return { success: true, documento: updatedDocumento };
}
