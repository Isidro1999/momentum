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

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-sm lg:hidden"
      aria-label="Navegación móvil"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = iconMap[item.id];
          const isActive = isActivePath(pathname, item.href);
          const className = `flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors sm:text-xs ${
            isActive ? "text-teal-700" : "text-slate-500"
          }`;

          return (
            <li key={item.id} className="flex-1">
              {item.href === "#" ? (
                <span
                  className="flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium text-slate-400 sm:text-xs"
                  title="Próximamente"
                >
                  {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
                  <span className="truncate">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={className}
                >
                  {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
