import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-slate-900">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 bg-slate-50/50 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
