"use client";

import Link from "next/link";
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
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!name.trim()) {
      next.name = "El nombre es obligatorio.";
    }

    if (!email.trim()) {
      next.email = "El email es obligatorio.";
    } else if (!isValidEmail(email.trim())) {
      next.email = "Ingresá un email válido.";
    }

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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setFormError(mapAuthError(error));
        return;
      }

      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Revisá tu email para confirmar la cuenta antes de iniciar sesión.",
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
        id="name"
        label="Nombre"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        disabled={isSubmitting || Boolean(successMessage)}
      />

      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        disabled={isSubmitting || Boolean(successMessage)}
      />

      <AuthField
        id="password"
        label="Contraseña"
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
        <AuthSubmitButton loading={isSubmitting}>Crear cuenta</AuthSubmitButton>
      ) : null}

      <p className="text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-teal-700 hover:text-teal-800"
        >
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}
