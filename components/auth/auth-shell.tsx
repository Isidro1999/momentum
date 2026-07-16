import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          Organización personal
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Momentum
        </h1>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
