"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserAccess(userId: string, formData: FormData) {
  const perfilId = formData.get("perfilId") as string;
  const areasAccess = formData.getAll("areasAcesso") as string[];

  if (!userId) {
    throw new Error("ID de usuário inválido.");
  }

  // Update Perfil and connect areas
  await prisma.user.update({
    where: { id: userId },
    data: {
      perfilId: perfilId || null,
      areasAcesso: {
        set: areasAccess.filter(id => id).map(id => ({ id }))
      }
    }
  });

  revalidatePath("/dashboard/usuarios");
}
