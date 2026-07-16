/**
 * Maps common Supabase Auth error codes/messages to Spanish UI copy.
 * Never expose raw internal messages to the user.
 */

export function mapAuthError(error: {
  message?: string;
  code?: string;
  status?: number;
} | null | undefined): string {
  if (!error) {
    return "Ocurrió un error. Intentá de nuevo.";
  }

  const message = (error.message ?? "").toLowerCase();
  const code = (error.code ?? "").toLowerCase();

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return "Email o contraseña incorrectos.";
  }

  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("user already registered")
  ) {
    return "Ya existe una cuenta con este email.";
  }

  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "Tenés que confirmar tu email antes de iniciar sesión.";
  }

  if (
    code === "weak_password" ||
    message.includes("password should be at least") ||
    message.includes("password is known to be weak") ||
    message.includes("weak password")
  ) {
    return "La contraseña es demasiado débil. Usá al menos 8 caracteres.";
  }

  if (
    code === "otp_expired" ||
    code === "flow_state_expired" ||
    message.includes("expired") ||
    message.includes("token has expired") ||
    message.includes("link is invalid or has expired")
  ) {
    return "El enlace expiró o ya no es válido. Pedí uno nuevo.";
  }

  if (message.includes("signup is disabled")) {
    return "El registro no está disponible en este momento.";
  }

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Demasiados intentos. Esperá un momento e intentá de nuevo.";
  }

  return "Ocurrió un error. Intentá de nuevo.";
}
