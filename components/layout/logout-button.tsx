"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { signOutAction } from "@/lib/auth/actions";

interface LogoutButtonProps {
  compact?: boolean;
}

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (compact) {
    return (
      <button
        type="button"
        disabled={isPending}
        aria-label={isPending ? "Cerrando sesión" : "Cerrar sesión"}
        onClick={() => {
          startTransition(async () => {
            await signOutAction();
          });
        }}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut className="size-3.5 shrink-0" aria-hidden />
        {isPending ? "…" : "Salir"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
        });
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      {isPending ? "Cerrando…" : "Cerrar sesión"}
    </button>
  );
}
