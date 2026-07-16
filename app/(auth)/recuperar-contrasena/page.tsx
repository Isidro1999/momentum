import { AuthShell } from "@/components/auth/auth-shell";
import { RecoverPasswordForm } from "@/components/auth/recover-password-form";

export default function RecoverPasswordPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      description="Te enviaremos un enlace para restablecer tu acceso."
    >
      <RecoverPasswordForm />
    </AuthShell>
  );
}
