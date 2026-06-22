import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">Sistema de Gestão de Documentos</h1>
        
        <p className="text-sm text-slate-600 text-center mb-8">
          Selecione o seu modo de acesso para entrar no sistema.
        </p>

        <div className="space-y-4">
          <form action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}>
            <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <span className="text-lg">G</span> Fazer Login com Google
            </button>
          </form>
        </div>
        <div className="mt-6 text-center text-xs text-slate-500">
          O seu nível de permissão inicial será de Consulta. Para editar, solicite acesso ao Administrador.
        </div>
      </div>
    </div>
  );
}
