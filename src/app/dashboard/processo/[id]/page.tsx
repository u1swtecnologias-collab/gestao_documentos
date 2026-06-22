import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import CreateGDocModal from "@/components/CreateGDocModal";
import EditProcessModal from "@/components/EditProcessModal";
import EditDocumentModal from "@/components/EditDocumentModal";
import DeleteButton from "@/components/DeleteButton";

export default async function ProcessoPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const perfilNome = (session?.user as any)?.perfilNome;

  const processo = await prisma.processo.findUnique({
    where: { id },
    include: {
      areaPrincipal: true,
      areas: { include: { area: true } },
      status: true,
      criadoPor: true,
      documentos: { include: { tipo: true, criadoPor: true }, orderBy: { criadoEm: 'desc' } }
    }
  });

  if (!processo) return notFound();

  if (perfilNome !== "Administrador" && perfilNome !== "Gestor" && userId) {
    const userWithAreas = await prisma.user.findUnique({
      where: { id: userId as string },
      include: { areasAcesso: true }
    });
    
    const hasAccess = userWithAreas?.areasAcesso.some(a => a.id === processo.areaPrincipalId);
    if (!hasAccess) {
      return (
        <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm p-6 text-center text-slate-500">
          Acesso negado. Você não tem permissão para visualizar processos desta área.
        </div>
      );
    }
  }

  const tipos = await prisma.tipoDocumento.findMany({ select: { id: true, nome: true }});
  const areas = await prisma.area.findMany();
  const statusList = await prisma.statusProcesso.findMany();

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm p-6">
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{processo.numero}</h2>
          <p className="text-lg text-slate-600">{processo.nome}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded">
              {processo.areaPrincipal.nome}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              processo.status.nome === 'Aberto' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {processo.status.nome}
            </span>
            {processo.areas.map(a => (
              <span key={a.areaId} className="bg-slate-50 text-slate-500 text-xs px-2 py-1 rounded border border-slate-200">
                {a.area.nome}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mr-2 border-r pr-3">
            <EditProcessModal processo={processo} areas={areas} statusList={statusList} />
            <DeleteButton id={processo.id} type="processo" itemName={processo.nome} />
          </div>
          <UploadDocumentModal processoId={processo.id} tipos={tipos} />
          <CreateGDocModal processoId={processo.id} tipos={tipos} />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Documentos do Processo</h3>
        
        {processo.documentos.length === 0 ? (
          <div className="text-center text-slate-500 py-10 bg-slate-50 rounded border border-dashed">
            Nenhum documento encontrado neste processo.
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Nome</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Tipo</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Descrição</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Data</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Autor</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {processo.documentos.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold shrink-0 ${doc.driveTipo === 'gdoc' ? 'bg-blue-100 text-blue-500' : 'bg-red-100 text-red-500'}`}>
                        {doc.driveTipo === 'gdoc' ? 'D' : 'A'}
                      </span>
                      {doc.nome}
                    </td>
                    <td className="px-4 py-3">{doc.tipo.nome}</td>
                    <td className="px-4 py-3 truncate max-w-xs">{doc.descricao}</td>
                    <td className="px-4 py-3">{doc.criadoEm.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{doc.criadoPor.name || 'Desconhecido'}</td>
                    <td className="px-4 py-3 flex items-center justify-end gap-1">
                      <EditDocumentModal documento={doc} tipos={tipos} />
                      <DeleteButton id={doc.id} type="documento" itemName={doc.nome} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
