"use client";

import { useState } from "react";
import { updateUserAccess } from "@/app/actions/user";

export default function UserManagementClient({ users, perfis, areas }: any) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>, userId: string) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateUserAccess(userId, formData);
      setEditingUserId(null);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th className="px-6 py-3">Nome</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Perfil (Leitor/Editor)</th>
            <th className="px-6 py-3">Pastas Permitidas</th>
            <th className="px-6 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
              {editingUserId === user.id ? (
                <td colSpan={5} className="p-0">
                  <form onSubmit={(e) => handleSave(e, user.id)} className="p-4 bg-blue-50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-800">{user.name} <span className="font-normal text-slate-500">({user.email})</span></div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditingUserId(null)} className="px-3 py-1 text-slate-600 bg-white border rounded hover:bg-slate-100">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700">Salvar</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nível de Acesso (Perfil)</label>
                        <select name="perfilId" defaultValue={user.perfilId || ""} className="w-full border rounded p-2 bg-white">
                          <option value="">Selecione...</option>
                          {perfis.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pastas (Áreas) de Acesso</label>
                        <div className="max-h-32 overflow-y-auto border rounded p-2 bg-white space-y-1">
                          {areas.map((area: any) => (
                            <label key={area.id} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                name="areasAcesso" 
                                value={area.id} 
                                defaultChecked={user.areasAcesso.some((a: any) => a.id === area.id)}
                              />
                              <span>{area.codigo} - {area.nome}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </form>
                </td>
              ) : (
                <>
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                    <img src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full" />
                    {user.name}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                      {user.perfil?.nome || "Não definido"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.areasAcesso.length === 0 && <span className="text-slate-400 italic">Nenhuma</span>}
                      {user.areasAcesso.map((a: any) => (
                        <span key={a.id} className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded text-xs">
                          {a.nome}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setEditingUserId(user.id)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
