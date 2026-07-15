"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Settings,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { navItems } from "@/data/mock-data";

const iconMap: Record<string, LucideIcon> = {
  hoy: LayoutDashboard,
  tareas: CheckSquare,
  calendario: CalendarDays,
  objetivos: Target,
  bitacora: BookOpen,
  progreso: TrendingUp,
  configuracion: Settings,
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "#") {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden border-r border-slate-200/80 bg-white lg:flex">
      <div className="shrink-0 px-4 pb-2 pt-6">
        <div className="px-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            Organización personal
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Momentum
          </h1>
        </div>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        aria-label="Navegación principal"
      >
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.id];
            const isActive = isActivePath(pathname, item.href);
            const className = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-teal-50 text-teal-800"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`;

            if (item.href === "#") {
              return (
                <span
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400"
                  title="Próximamente"
                >
                  {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wide">
                    Pronto
                  </span>
                </span>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={className}
              >
                {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-slate-100 px-4 py-4">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3">
          <p className="text-xs font-medium text-slate-500">Sesión local</p>
          <p className="mt-0.5 text-sm leading-snug text-slate-700">
            Datos en este dispositivo
          </p>
        </div>
      </div>
    </aside>
  );
}
