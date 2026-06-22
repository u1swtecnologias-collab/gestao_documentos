import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import SidebarTree from "./SidebarTree";

export default async function Sidebar() {
  const session = await auth();
  const userId = session?.user?.id;
  const perfilNome = (session?.user as any)?.perfilNome;

  let whereProcesso: any = {};

  if (perfilNome !== "Administrador" && perfilNome !== "Gestor" && userId) {
    const userWithAreas = await prisma.user.findUnique({
      where: { id: userId as string },
      include: { areasAcesso: true }
    });
    
    if (userWithAreas && userWithAreas.areasAcesso.length > 0) {
      const areaIds = userWithAreas.areasAcesso.map(a => a.id);
      whereProcesso = { areaPrincipalId: { in: areaIds } };
    } else if (userWithAreas && userWithAreas.areasAcesso.length === 0) {
      whereProcesso = { id: "none" }; 
    }
  }

  const areas = await prisma.area.findMany({
    where: {
      processosPrincipais: {
        some: whereProcesso
      }
    },
    include: {
      processosPrincipais: {
        where: whereProcesso,
        include: {
          documentos: {
            orderBy: { criadoEm: 'desc' }
          }
        },
        orderBy: { numero: 'asc' }
      }
    },
    orderBy: { nome: 'asc' }
  });

  return (
    <aside className="w-80 border-r bg-slate-50 flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-4 border-b bg-slate-100/50">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Árvore Documental</h2>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <SidebarTree areas={areas} />
      </div>
    </aside>
  );
}
