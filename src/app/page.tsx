import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();

  // Se já estiver logado, redireciona para o dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Cabeçalho Público */}
      <header className="w-full bg-white border-b py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            G
          </div>
          <span className="text-xl font-bold text-slate-800">Gestor de Documentos</span>
        </div>
        <div className="hidden md:flex gap-4">
          <a href="/privacidade" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Privacidade</a>
          <a href="/termos" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Termos</a>
        </div>
      </header>

      {/* Conteúdo Principal (Landing Page) */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 md:p-12 max-w-6xl mx-auto gap-12">
        
        {/* Texto Explicativo (Propósito do App) */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Gestão inteligente para os seus arquivos
          </h1>
          <p className="text-lg text-slate-600">
            O <strong>Gestor de Documentos</strong> é uma plataforma segura e centralizada criada para organizar processos, áreas e documentos da sua equipe. 
            Facilite a busca, controle acessos com níveis de permissão e tenha tudo na nuvem, acessível a qualquer momento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
            <div className="flex items-center gap-2 text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Seguro
            </div>
            <div className="flex items-center gap-2 text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Organizado
            </div>
          </div>
        </div>

        {/* Caixa de Login */}
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Acesso ao Sistema</h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Faça login com sua conta corporativa para acessar seus documentos.
          </p>

          <form action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}>
            <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3">
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            Acesso restrito a usuários autorizados. Ao entrar, você concorda com nossos <a href="/termos" className="underline hover:text-slate-600">Termos</a> e <a href="/privacidade" className="underline hover:text-slate-600">Privacidade</a>.
          </div>
        </div>

      </main>

      {/* Rodapé Mobile */}
      <footer className="md:hidden py-6 text-center space-x-4">
        <a href="/privacidade" className="text-xs text-slate-500 underline">Política de Privacidade</a>
        <a href="/termos" className="text-xs text-slate-500 underline">Termos de Serviço</a>
      </footer>
    </div>
  );
}
