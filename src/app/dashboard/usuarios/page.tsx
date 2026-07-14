import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserManagementClient from "./UserManagementClient";

export default async function UsuariosPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  // Permite acesso apenas ao Administrador
  // if ((session.user as any)?.perfilNome !== "Administrador") {
  //   return (
  //     <div className="p-6 text-center text-slate-500">
  //       Acesso negado. Apenas administradores podem visualizar esta página.
  //     </div>
  //   );
  // }

  const users = await prisma.user.findMany({
    include: {
      perfil: true,
      areasAcesso: true
    }
  });

  const perfis = await prisma.perfil.findMany();
  const areas = await prisma.area.findMany();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h1>
        <p className="text-sm text-slate-500">Gerencie os níveis de acesso e pastas de cada usuário.</p>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <UserManagementClient users={users} perfis={perfis} areas={areas} />
      </div>
    </div>
  );
}
