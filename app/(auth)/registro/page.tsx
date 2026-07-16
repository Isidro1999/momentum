import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      description="Registrate para guardar tu progreso en Momentum."
    >
      <RegisterForm />
    </AuthShell>
  );
}
