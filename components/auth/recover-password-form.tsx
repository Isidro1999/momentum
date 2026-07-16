"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import {
  AuthField,
  AuthFormError,
  AuthFormSuccess,
  AuthSubmitButton,
} from "@/components/auth/auth-form-fields";
import { mapAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function RecoverPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setEmailError("El email es obligatorio.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setEmailError("Ingresá un email válido.");
      return;
    }

    setEmailError(undefined);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/actualizar-contrasena`,
        },
      );

      if (error) {
        setFormError(mapAuthError(error));
        return;
      }

      setSuccessMessage(
        "Si el email está registrado, te enviamos un enlace para restablecer la contraseña.",
      );
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
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={emailError}
        disabled={isSubmitting || Boolean(successMessage)}
      />

      {!successMessage ? (
        <AuthSubmitButton loading={isSubmitting}>
          Enviar enlace
        </AuthSubmitButton>
      ) : null}

      <p className="text-center text-sm text-slate-600">
        <Link
          href="/login"
          className="font-medium text-teal-700 hover:text-teal-800"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  );
}
