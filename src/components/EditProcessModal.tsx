"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { editProcess } from "@/app/actions/process";

type Area = { id: string; nome: string };
type Status = { id: string; nome: string };
type Processo = {
  id: string;
  nome: string;
  statusId: string;
  areas: { areaId: string }[];
};

export default function EditProcessModal({ 
  processo, 
  areas,
  statusList 
}: { 
  processo: Processo;
  areas: Area[];
  statusList: Status[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await editProcess(processo.id, formData);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao editar processo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Editar Processo"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Editar Processo</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
               <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Processo *</label>
                <input 
                  type="text" 
                  name="nome" 
                  defaultValue={processo.nome}
                  required
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                <select 
                  name="statusId" 
                  defaultValue={processo.statusId}
                  required
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {statusList.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Áreas Envolvidas</label>
                <select 
                  name="areasEnvolvidas" 
                  multiple
                  defaultValue={processo.areas.map(a => a.areaId)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white min-h-[80px]"
                >
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Segure CTRL (ou CMD) para selecionar múltiplas.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
