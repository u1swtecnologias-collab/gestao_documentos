"use client";

import { useState } from "react";
import { solicitarAcessoAction } from "@/app/actions/email";

export default function RequestAccessButton() {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const response = await solicitarAcessoAction();
      if (response.success) {
        alert(response.message);
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
    >
      {loading ? "Enviando..." : "Solicitar Acesso"}
    </button>
  );
}
