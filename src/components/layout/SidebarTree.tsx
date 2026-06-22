"use client"

import { useState } from "react"
import { FolderOpen, ChevronRight, ChevronDown, Layers } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SidebarTree({ areas }: { areas: any[] }) {
  const pathname = usePathname();
  const [openAreas, setOpenAreas] = useState<Record<string, boolean>>({});
  const [openProcesses, setOpenProcesses] = useState<Record<string, boolean>>({});

  const toggleArea = (id: string) => {
    setOpenAreas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleProcess = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenProcesses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (areas.length === 0) {
    return <div className="text-slate-500 italic">Nenhum processo encontrado.</div>;
  }

  return (
    <ul className="space-y-2 text-sm select-none">
      {areas.map(area => (
        <li key={area.id}>
          {/* Nível 1: Área */}
          <div 
            className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer transition-colors"
            onClick={() => toggleArea(area.id)}
          >
            {openAreas[area.id] ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />}
            <Layers className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="truncate">{area.nome}</span>
            <span className="ml-auto text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border">
              {area.processosPrincipais.length}
            </span>
          </div>

          {/* Nível 2: Processos */}
          {openAreas[area.id] && (
            <ul className="ml-4 mt-1 border-l border-slate-300 pl-2 space-y-1">
              {area.processosPrincipais.length === 0 && (
                <li className="text-xs text-slate-400 p-1 pl-6">Vazio</li>
              )}
              {area.processosPrincipais.map((proc: any) => {
                const isActive = pathname === `/dashboard/processo/${proc.id}`;
                return (
                  <li key={proc.id}>
                    <div className="flex items-center gap-1 group">
                      <div 
                        className="p-1 cursor-pointer hover:bg-slate-200 rounded"
                        onClick={(e) => toggleProcess(proc.id, e)}
                      >
                        {openProcesses[proc.id] ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                      </div>
                      <Link href={`/dashboard/processo/${proc.id}`} className="flex-1 overflow-hidden">
                        <div className={`flex items-center gap-2 p-1.5 rounded-md border ${isActive ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'} transition-colors`}>
                          <FolderOpen className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-blue-500'}`} />
                          <span className="truncate">{proc.numero}</span>
                          <span className="ml-auto text-[10px] text-slate-400 shrink-0">
                            {proc.documentos.length} doc{proc.documentos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Nível 3: Documentos */}
                    {openProcesses[proc.id] && (
                      <ul className="ml-5 mt-1 border-l border-slate-200 pl-3 space-y-1 mb-2">
                        {proc.documentos.length === 0 && (
                          <li className="text-xs text-slate-400 p-1">Nenhum documento</li>
                        )}
                        {proc.documentos.map((doc: any) => (
                          <li key={doc.id} className="flex items-center gap-2 p-1 text-slate-600 hover:text-blue-600 cursor-pointer text-xs group/doc">
                            <span className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center font-bold shrink-0 ${doc.driveTipo === 'gdoc' ? 'bg-blue-100 text-blue-500' : 'bg-red-100 text-red-500'}`}>
                              {doc.driveTipo === 'gdoc' ? 'D' : 'A'}
                            </span>
                            <span className="truncate group-hover/doc:underline">{doc.nome}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
