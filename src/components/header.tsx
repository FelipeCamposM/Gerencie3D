"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserDisplayName,
  isUserAdmin,
  canCreateSolicitacao,
} from "@/lib/auth";
import ChangePasswordModal from "@/components/ChangePasswordModal";

// Ícones Lucide
import {
  Home,
  Users,
  Power,
  User,
  Lock,
  ChevronDown,
  Printer,
  ClipboardList,
  Package,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Início", icon: <Home size={20} /> },
  {
    href: "/impressoras",
    label: "Impressoras",
    icon: <Printer size={20} />,
  },
  {
    href: "/impressoes",
    label: "Impressões",
    icon: <ClipboardList size={20} />,
  },
  {
    href: "/filamentos",
    label: "Filamentos",
    icon: <Package size={20} />,
  },
  {
    href: "/usuarios",
    label: "Usuários",
    icon: <Users size={20} />,
    adminOnly: true,
  },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = isUserAdmin(user);
  const canCreate = canCreateSolicitacao(user);

  // Filter navigation links based on user level and permissions
  const filteredNavLinks = navLinks.filter((link) => {
    if (link.adminOnly && !isAdmin) return false;
    if (link.requiresCreatePermission && !canCreate) return false;
    return true;
  });

  const handleLogout = async () => {
    await logout(); // O AuthContext já faz o redirecionamento
  };

  return (
    <>
      {/* Modal de Logout */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-800 border-none">
          <DialogHeader>
            <DialogTitle className="text-white">
              Deseja realmente sair?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button
              variant="secondary"
              className="bg-gray-500 hover:bg-gray-600 text-white border-none cursor-pointer"
              onClick={() => setOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="bg-[#e94a4a] hover:bg-[#e94a4ae3] text-white cursor-pointer"
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              type="button"
            >
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-700 text-white shadow-lg w-full border-b border-slate-600">
        {/* Logo e Nome (clickável) */}
        <Link
          href="/"
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
        >
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={50}
            height={50}
            className="w-10 h-10"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold">Gerencie 3D</span>
            {user && (
              <span className="text-sm text-gray-300">
                Olá,{" "}
                <strong className="text-green-400">
                  {getUserDisplayName(user)}
                </strong>
              </span>
            )}
          </div>
        </Link>

        {/* Navegação */}
        <nav className="flex items-center gap-6">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition
                ${
                  pathname === link.href
                    ? "bg-slate-600 text-white font-semibold"
                    : "hover:bg-slate-600/50"
                }
              `}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {/* Menu do Usuário */}
          <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-md transition cursor-pointer">
                <User size={20} />
                <span>{user?.primeiroNome}</span>
                <ChevronDown size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-white border-slate-200 text-slate-900 p-1 shadow-lg">
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-md transition w-full text-left"
                >
                  <Lock size={16} />
                  <span>Alterar Senha</span>
                </button>
                <div className="h-px bg-slate-200 my-1" />
                <button
                  onClick={() => {
                    setOpen(true);
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#e94a4a] hover:bg-[#e94a4ae3] rounded-md transition w-full text-left text-white"
                >
                  <Power size={16} />
                  <span>Sair</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </nav>
      </header>

      {/* Modal de Alterar Senha */}
      <ChangePasswordModal
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </>
  );
}
