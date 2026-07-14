import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AreaManagementClient from "./AreaManagementClient";

export default async function AreasPage() {
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

  const areas = await prisma.area.findMany({
    orderBy: { codigo: 'asc' },
    include: {
      _count: {
        select: { processosPrincipais: true }
      }
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gestão de Áreas</h1>
        <p className="text-sm text-slate-500">Gerencie as pastas/áreas do sistema e seus respectivos prefixos.</p>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <AreaManagementClient areas={areas} />
      </div>
    </div>
  );
}
