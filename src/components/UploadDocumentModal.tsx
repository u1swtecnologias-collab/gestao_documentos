"use client";

import { useState } from "react";
import { FilePlus, X } from "lucide-react";
import { uploadFile } from "@/app/actions/document";
import { createTipoDocumento } from "@/app/actions/tipoDocumento";

export default function UploadDocumentModal({ processoId, tipos }: { processoId: string, tipos: { id: string, nome: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewTipo, setIsNewTipo] = useState(false);
  const [novoTipoNome, setNovoTipoNome] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("processoId", processoId);
    
    try {
      let finalTipoId = formData.get("tipoId") as string;
      
      if (finalTipoId === "NEW") {
        if (!novoTipoNome.trim()) {
          throw new Error("Digite o nome do novo tipo.");
        }
        const res = await createTipoDocumento(novoTipoNome);
        finalTipoId = res.tipo.id;
        formData.set("tipoId", finalTipoId);
      }

      await uploadFile(formData);
      setIsOpen(false);
      setIsNewTipo(false);
      setNovoTipoNome("");
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao fazer upload.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded transition-colors"
      >
        <FilePlus className="h-4 w-4" />
        Inserir Arquivo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Inserir Arquivo</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo *</label>
                <input 
                  type="file" 
                  name="file" 
                  required
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento *</label>
                <select 
                  name="tipoId" 
                  required
                  onChange={(e) => setIsNewTipo(e.target.value === "NEW")}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecione...</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                  <option value="NEW" className="font-bold text-blue-600">+ Criar Novo Tipo</option>
                </select>
                
                {isNewTipo && (
                  <div className="mt-2">
                    <input 
                      type="text" 
                      placeholder="Nome do novo tipo..."
                      value={novoTipoNome}
                      onChange={(e) => setNovoTipoNome(e.target.value)}
                      required
                      className="w-full border border-blue-300 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-blue-50" 
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                <textarea 
                  name="descricao" 
                  required
                  rows={2}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comentário</label>
                <textarea 
                  name="comentario" 
                  rows={2}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : "Fazer Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
