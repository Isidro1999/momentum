import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      description="Entrá a Momentum para seguir tu día con claridad."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
