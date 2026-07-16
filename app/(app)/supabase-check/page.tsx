import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Ruta temporal de diagnóstico de conexión a Supabase.
 * No está en la navegación. Eliminar cuando la integración esté estable.
 * Ver docs/supabase-setup.md.
 */

type CheckStatus =
  | "connected"
  | "not_configured"
  | "schema_pending"
  | "error";

type CheckResult = {
  status: CheckStatus;
  message: string;
};

function isMissingRelationError(error: {
  code?: string;
  message?: string;
}): boolean {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "PGRST205" ||
    code === "42P01" ||
    message.includes("could not find the table") ||
    (message.includes("relation") && message.includes("does not exist")) ||
    message.includes("schema cache")
  );
}

async function runSupabaseCheck(): Promise<CheckResult> {
  if (!getSupabasePublicEnv()) {
    return {
      status: "not_configured",
      message: "Supabase no configurado",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (!error) {
      return {
        status: "connected",
        message: "Supabase conectado",
      };
    }

    if (isMissingRelationError(error)) {
      return {
        status: "schema_pending",
        message: "Conexión disponible, esquema pendiente",
      };
    }

    return {
      status: "error",
      message: "No se pudo verificar la conexión con Supabase",
    };
  } catch {
    return {
      status: "error",
      message: "No se pudo verificar la conexión con Supabase",
    };
  }
}

const statusStyles: Record<CheckStatus, string> = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-900",
  not_configured: "border-amber-200 bg-amber-50 text-amber-900",
  schema_pending: "border-sky-200 bg-sky-50 text-sky-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

export default async function SupabaseCheckPage() {
  const result = await runSupabaseCheck();

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-sm uppercase tracking-wide text-zinc-500">
        Diagnóstico temporal
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
        Supabase check
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Esta ruta no forma parte de la navegación de Momentum. Sirve solo para
        validar la conexión antes de migrar providers.
      </p>
      <div
        className={`mt-8 rounded-lg border px-4 py-3 text-base font-medium ${statusStyles[result.status]}`}
        role="status"
      >
        {result.message}
      </div>
    </main>
  );
}
