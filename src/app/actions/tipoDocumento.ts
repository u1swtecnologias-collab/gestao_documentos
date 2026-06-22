"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTipoDocumento(nome: string) {
  const session = await auth();
  
  if (!session || !session.user) {
    throw new Error("Não autorizado");
  }

  const trimmedNome = nome.trim();
  if (!trimmedNome) {
    throw new Error("Nome do tipo de documento é obrigatório.");
  }

  // Verificar se já existe
  const existing = await prisma.tipoDocumento.findUnique({
    where: { nome: trimmedNome }
  });

  if (existing) {
    throw new Error("Já existe um tipo de documento com este nome.");
  }

  const novoTipo = await prisma.tipoDocumento.create({
    data: {
      nome: trimmedNome
    }
  });

  revalidatePath("/dashboard");
  return { success: true, tipo: novoTipo };
}
