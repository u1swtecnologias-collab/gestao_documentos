"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createArea(formData: FormData) {
  const session = await auth();
  const nome = formData.get("nome") as string;

  if (!nome || nome.trim() === "") {
    throw new Error("Nome da área é obrigatório");
  }

  // Get all areas to find the next available codigo (filling gaps)
  const allAreas = await prisma.area.findMany({
    orderBy: { codigo: 'asc' }
  });

  let nextCodigoNum = 1;
  for (const area of allAreas) {
    const cod = parseInt(area.codigo, 10);
    if (!isNaN(cod) && cod === nextCodigoNum) {
      nextCodigoNum++;
    }
  }
  const nextCodigo = nextCodigoNum.toString().padStart(2, '0');

  const data: any = {
    nome: nome.trim(),
    codigo: nextCodigo,
  };

  if (session?.user?.id) {
    data.usuariosComAcesso = {
      connect: { id: session.user.id }
    };
  }

  await prisma.area.create({
    data
  });

  revalidatePath("/dashboard");
}

export async function deleteArea(areaId: string) {
  await prisma.area.delete({
    where: { id: areaId }
  });
  revalidatePath("/dashboard");
}
