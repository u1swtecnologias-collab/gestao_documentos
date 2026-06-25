import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import CreateProcessModal from "@/components/CreateProcessModal";
import CreateAreaModal from "@/components/CreateAreaModal";

export default async function Header() {
  const session = await auth();
  const areas = await prisma.area.findMany({ select: { id: true, nome: true }});

  return (
    <header className="flex flex-col md:flex-row h-auto md:h-16 items-center justify-between border-b px-4 py-3 md:py-0 md:px-6 bg-white shrink-0 gap-3 md:gap-0">
      <div className="flex items-center gap-2 text-center">
        <h1 className="text-lg md:text-xl font-semibold text-slate-800">
          Sistema de Gestão de Documentos
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
        {session?.user && ((session.user as any).perfilNome === "Administrador" || (session.user as any).perfilNome === "Gestor") && (
          <div className="flex items-center gap-3 mr-2">
            <a href="/dashboard/usuarios" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Usuários
            </a>
            <a href="/dashboard/areas" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Áreas
            </a>
          </div>
        )}
        <CreateAreaModal />
        <CreateProcessModal areas={areas} />

        {session?.user && (session.user as any).perfilNome === "Consulta" && (
          <a 
            href="mailto:u1.swtecnologias@gmail.com?subject=Solicitação de Acesso ao Sistema de Gestão de Documentos&body=Olá administrador, solicito alteração do meu perfil de acesso para Editor/Gestor no Sistema de Gestão de Documentos." 
            className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
          >
            Solicitar Acesso
          </a>
        )}

        <div className="flex items-center gap-3 ml-4 border-l pl-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-slate-700">{session?.user?.name || 'Usuário'}</span>
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-slate-500">{(session?.user as any)?.perfilNome || 'Perfil'}</span>
              <span className="text-slate-300">•</span>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium">Sair</button>
              </form>
            </div>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
