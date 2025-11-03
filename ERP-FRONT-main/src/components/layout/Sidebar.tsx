// Caminho: ERP-FRONT-main/src/components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Calendar,
  BarChart3,
  Landmark,
  ClipboardList, // Ícone para a Ordem de Serviço
} from "lucide-react";
import Image from "next/image";

// --- ALTERAÇÃO AQUI ---
// Lista de navegação com o href do Dashboard atualizado
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Vendas", href: "/vendas", icon: ShoppingCart },
  { name: "Ordens de Serviço", href: "/ordens-servico", icon: ClipboardList }, // NOVO ITEM AQUI
  { name: "Boletos", href: "/boletos", icon: FileText },
  { name: "Produtos", href: "/produtos", icon: Package },
  { name: "Caixa", href: "/caixa", icon: Landmark },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border flex justify-center">
        {/* --- ALTERAÇÃO AQUI --- */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/logo-mind.png"
            alt="Logo"
            width={150}
            height={150}
            className="w-20 h-20"
          />
        </Link>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onLinkClick}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all text-sm font-medium
                  ${
                    // --- ALTERAÇÃO AQUI ---
                    // Lógica de path exato para o dashboard
                    pathname === item.href || (pathname === "/" && item.href === "/dashboard")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}