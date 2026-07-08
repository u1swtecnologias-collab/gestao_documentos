"use client"

import { useState, useMemo, useEffect } from "react"
import { FolderOpen, Folder, ChevronRight, ChevronDown, Layers, File, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SidebarTree({ areas }: { areas: any[] }) {
  const pathname = usePathname();
  const [openAreas, setOpenAreas] = useState<Record<string, boolean>>({});
  const [openProcesses, setOpenProcesses] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Filtering logic
  const filteredAreas = useMemo(() => {
    if (!searchTerm) return areas;

    const lowerSearch = searchTerm.toLowerCase();

    return areas.map(area => {
      const areaMatches = area.nome.toLowerCase().includes(lowerSearch) || 
                          (area.codigo && area.codigo.toLowerCase().includes(lowerSearch));

      const filteredProcesses = area.processosPrincipais.map((proc: any) => {
        const procMatches = proc.numero.toLowerCase().includes(lowerSearch) || 
                            proc.nome.toLowerCase().includes(lowerSearch);

        const filteredDocs = proc.documentos.filter((doc: any) => 
          doc.nome.toLowerCase().includes(lowerSearch) || 
          (doc.descricao && doc.descricao.toLowerCase().includes(lowerSearch)) ||
          (doc.comentario && doc.comentario.toLowerCase().includes(lowerSearch))
        );

        if (procMatches || filteredDocs.length > 0) {
          return { ...proc, documentos: filteredDocs, matchedByChild: !procMatches && filteredDocs.length > 0 };
        }
        return null;
      }).filter(Boolean);

      if (areaMatches || filteredProcesses.length > 0) {
        return { ...area, processosPrincipais: filteredProcesses, matchedByChild: !areaMatches && filteredProcesses.length > 0 };
      }
      return null;
    }).filter(Boolean);

  }, [areas, searchTerm]);

  // Auto-expand on search
  useEffect(() => {
    if (searchTerm) {
      const newOpenAreas: Record<string, boolean> = { ...openAreas };
      const newOpenProcesses: Record<string, boolean> = { ...openProcesses };

      filteredAreas.forEach((area: any) => {
        if (area.matchedByChild || area.processosPrincipais.length > 0) {
          newOpenAreas[area.id] = true;
          area.processosPrincipais.forEach((proc: any) => {
             if (proc.matchedByChild || proc.documentos.length > 0) {
               newOpenProcesses[proc.id] = true;
             }
          });
        }
      });
      
      setOpenAreas(newOpenAreas);
      setOpenProcesses(newOpenProcesses);
    }
  }, [searchTerm, filteredAreas]);

  const toggleArea = (id: string) => {
    setOpenAreas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleProcess = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenProcesses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (areas.length === 0) {
    return <div className="text-slate-500 italic">Nenhum documento encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar pastas, arquivos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
          />
        </div>
      </div>
      
      {filteredAreas.length === 0 ? (
        <div className="text-slate-500 text-sm italic text-center mt-4">Nenhum resultado encontrado.</div>
      ) : (
        <ul className="space-y-1 text-sm select-none">
          {filteredAreas.map((area: any) => (
            <li key={area.id}>
              {/* Nível 1: Área */}
              <div 
                className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-200 text-slate-800 cursor-pointer transition-colors"
                onClick={() => toggleArea(area.id)}
              >
                {openAreas[area.id] ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />}
                <Folder className="h-4 w-4 text-amber-500 shrink-0 fill-amber-500/20" />
                <span className="truncate font-semibold">{area.nome} {area.codigo ? `(${area.codigo})` : ''}</span>
              </div>

              {/* Nível 2: Processos */}
              {openAreas[area.id] && (
                <ul className="ml-5 border-l border-slate-300 pl-2 space-y-1 mt-1 mb-2">
                  {area.processosPrincipais.length === 0 && (
                    <li className="text-xs text-slate-400 p-1 pl-6">Pasta vazia</li>
                  )}
                  {area.processosPrincipais.map((proc: any) => {
                    const isActive = pathname === `/dashboard/processo/${proc.id}`;
                    return (
                      <li key={proc.id}>
                        <div className="flex items-center gap-1 group">
                          <div 
                            className="p-1 cursor-pointer hover:bg-slate-200 rounded shrink-0"
                            onClick={(e) => toggleProcess(proc.id, e)}
                          >
                            {openProcesses[proc.id] ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                          </div>
                          <Link href={`/dashboard/processo/${proc.id}`} className="flex-1 overflow-hidden">
                            <div className={`flex items-center gap-1.5 p-1.5 rounded-md ${isActive ? 'bg-blue-100 text-blue-800 font-medium' : 'text-slate-700 hover:bg-slate-100'} transition-colors`}>
                              {openProcesses[proc.id] ? 
                                <FolderOpen className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 fill-blue-600/20' : 'text-amber-500 fill-amber-500/20'}`} /> : 
                                <Folder className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 fill-blue-600/20' : 'text-amber-500 fill-amber-500/20'}`} />
                              }
                              <span className="truncate">{proc.numero} - {proc.nome}</span>
                            </div>
                          </Link>
                        </div>

                        {/* Nível 3: Documentos */}
                        {openProcesses[proc.id] && (
                          <ul className="ml-6 border-l border-slate-200 pl-3 space-y-0.5 mt-1 mb-2">
                            {proc.documentos.length === 0 && (
                              <li className="text-xs text-slate-400 p-1">Nenhum arquivo</li>
                            )}
                            {proc.documentos.map((doc: any) => (
                              <li key={doc.id} className="flex items-center gap-2 p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer text-xs group/doc transition-colors">
                                <File className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover/doc:text-blue-500" />
                                <span className="truncate">{doc.nome}</span>
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
      )}
    </div>
  )
}
