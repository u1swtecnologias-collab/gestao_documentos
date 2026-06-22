"use client";

import { useState } from "react";
import { deleteArea } from "@/app/actions/area";
import { Trash2 } from "lucide-react";

export default function AreaManagementClient({ areas }: any) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a área "${name}"? Processos vinculados poderão ficar órfãos ou ser excluídos (dependendo da configuração do banco).`)) {
      return;
    }
    
    setLoadingId(id);
    try {
      await deleteArea(id);
    } catch (err: any) {
      alert(err.message || "Erro ao excluir área");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th className="px-6 py-3">Prefixo / Código</th>
            <th className="px-6 py-3">Nome da Área</th>
            <th className="px-6 py-3 text-center">Nº de Processos</th>
            <th className="px-6 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {areas.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-slate-400 italic">Nenhuma área cadastrada.</td>
            </tr>
          )}
          {areas.map((area: any) => (
            <tr key={area.id} className="bg-white border-b hover:bg-slate-50">
              <td className="px-6 py-4 font-mono font-medium text-slate-700">
                {area.codigo}
              </td>
              <td className="px-6 py-4 font-medium text-slate-900">
                {area.nome}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                  {area._count.processosPrincipais}
                </span>
              </td>
              <td className="px-6 py-4 flex justify-end">
                <button 
                  onClick={() => handleDelete(area.id, area.nome)}
                  disabled={loadingId === area.id}
                  className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                  title="Excluir Área"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
