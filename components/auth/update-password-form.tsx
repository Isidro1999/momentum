"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  AuthField,
  AuthFormError,
  AuthFormSuccess,
  AuthSubmitButton,
} from "@/components/auth/auth-form-fields";
import { mapAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!password) {
      next.password = "La contraseña es obligatoria.";
    } else if (password.length < 8) {
      next.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Confirmá tu contraseña.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Las contraseñas no coinciden.";
    }

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    setSuccessMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setFormError(mapAuthError(error));
        return;
      }

      setSuccessMessage("Contraseña actualizada. Redirigiendo…");
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setFormError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <AuthFormError message={formError} />
      <AuthFormSuccess message={successMessage} />

      <AuthField
        id="password"
        label="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        disabled={isSubmitting || Boolean(successMessage)}
      />

      <AuthField
        id="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={errors.confirmPassword}
        disabled={isSubmitting || Boolean(successMessage)}
      />

      {!successMessage ? (
        <AuthSubmitButton loading={isSubmitting}>
          Guardar contraseña
        </AuthSubmitButton>
      ) : null}
    </form>
  );
}
