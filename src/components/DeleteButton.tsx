"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteProcess } from "@/app/actions/process";
import { deleteDocument } from "@/app/actions/document";
import { useRouter } from "next/navigation";

type DeleteType = "processo" | "documento";

export default function DeleteButton({ 
  id, 
  type, 
  itemName 
}: { 
  id: string; 
  type: DeleteType; 
  itemName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      if (type === "processo") {
        await deleteProcess(id);
        // deleteProcess already revalidates and redirects if needed, but router.push might be safer if we are on the page
        router.push("/dashboard");
      } else {
        await deleteDocument(id);
      }
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Erro ao excluir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={
          type === "processo"
            ? "flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            : "text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition-colors"
        }
        title={`Excluir ${type}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Excluir {type}?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Tem certeza que deseja excluir <strong>{itemName}</strong>? Esta ação não pode ser desfeita e removerá o item também do Google Drive.
            </p>

            {error && (
               <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md text-left">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors w-full"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 w-full"
              >
                {loading ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
