"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  AuthField,
  AuthFormError,
  AuthSubmitButton,
} from "@/components/auth/auth-form-fields";
import { mapAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

interface FormErrors {
  email?: string;
  password?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(
    searchParams.get("error") === "link"
      ? "El enlace expiró o ya no es válido. Pedí uno nuevo."
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!email.trim()) {
      next.email = "El email es obligatorio.";
    } else if (!isValidEmail(email.trim())) {
      next.email = "Ingresá un email válido.";
    }
    if (!password) {
      next.password = "La contraseña es obligatoria.";
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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(mapAuthError(error));
        return;
      }

      router.replace("/");
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

      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        disabled={isSubmitting}
      />

      <AuthField
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        disabled={isSubmitting}
      />

      <div className="flex justify-end">
        <Link
          href="/recuperar-contrasena"
          className="text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <AuthSubmitButton loading={isSubmitting}>Iniciar sesión</AuthSubmitButton>

      <p className="text-center text-sm text-slate-600">
        ¿No tenés cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium text-teal-700 hover:text-teal-800"
        >
          Registrate
        </Link>
      </p>
    </form>
  );
}
