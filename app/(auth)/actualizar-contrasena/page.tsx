import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      title="Nueva contraseña"
      description="Elegí una contraseña nueva de al menos 8 caracteres."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
