import React from "react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-gray-800 text-white flex flex-col py-8 px-4 min-h-screen">
      <div className="text-2xl font-bold mb-8 text-center">Menu</div>
      <nav className="flex flex-col gap-4">
        <Link
          href="/"
          className="hover:bg-gray-700 rounded px-3 py-2 transition"
        >
          Início
        </Link>
        <Link
          href="/impressoras"
          className="hover:bg-gray-700 rounded px-3 py-2 transition"
        >
          Impressoras
        </Link>
        <Link
          href="/impressoes-historico"
          className="hover:bg-gray-700 rounded px-3 py-2 transition"
        >
          Histórico de Impressões
        </Link>
        <Link
          href="/criar-impressao"
          className="hover:bg-gray-700 rounded px-3 py-2 transition"
        >
          Nova Impressão
        </Link>
        <Link
          href="/usuarios"
          className="hover:bg-gray-700 rounded px-3 py-2 transition"
        >
          Usuários
        </Link>
      </nav>
    </aside>
  );
}
