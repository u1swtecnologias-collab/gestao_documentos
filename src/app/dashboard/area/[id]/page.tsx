import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

export default async function AreaPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const perfilNome = (session?.user as any)?.perfilNome;

  const area = await prisma.area.findUnique({
    where: { id },
    include: {
      processosPrincipais: {
        include: {
          documentos: true,
          status: true
        },
        orderBy: { numero: 'asc' }
      }
    }
  });

  if (!area) return notFound();

  // Verifica permissão (mesma lógica do processo, mas baseada na própria área)
  if (perfilNome !== "Administrador" && perfilNome !== "Gestor" && userId) {
    const userWithAreas = await prisma.user.findUnique({
      where: { id: userId as string },
      include: { areasAcesso: true }
    });
    
    const hasAccess = userWithAreas?.areasAcesso.some(a => a.id === area.id);
    if (!hasAccess) {
      return (
        <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm p-6 text-center text-slate-500">
          Acesso negado. Você não tem permissão para visualizar o conteúdo desta área.
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm p-6">
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {area.codigo ? `${area.codigo} - ` : ''}{area.nome}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Pastas / Processos vinculados</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {area.processosPrincipais.length === 0 ? (
          <div className="text-center text-slate-500 py-10 bg-slate-50 rounded border border-dashed">
            Esta área está vazia. Nenhum processo encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {area.processosPrincipais.map(proc => (
              <Link 
                href={`/dashboard/processo/${proc.id}`} 
                key={proc.id}
                className="group flex flex-col p-4 border rounded-lg hover:border-blue-400 hover:shadow-md transition-all bg-white"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <FolderOpen size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate" title={proc.numero}>{proc.numero}</h3>
                    <p className="text-xs text-slate-500 truncate" title={proc.nome}>{proc.nome}</p>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 border-t flex justify-between items-center text-xs">
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    proc.status.nome === 'Aberto' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {proc.status.nome}
                  </span>
                  <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    {proc.documentos.length} doc{proc.documentos.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
