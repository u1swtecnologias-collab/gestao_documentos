"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createArea(formData: FormData) {
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

  await prisma.area.create({
    data: {
      nome: nome.trim(),
      codigo: nextCodigo,
    }
  });

  revalidatePath("/dashboard");
}

export async function deleteArea(areaId: string) {
  await prisma.area.delete({
    where: { id: areaId }
  });
  revalidatePath("/dashboard");
}
