import { createClient } from "@/lib/supabase/client";
import { RepositoryError } from "@/lib/repositories/errors";

export async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new RepositoryError(
      "Tu sesión expiró. Volvé a iniciar sesión para continuar.",
    );
  }

  return user.id;
}

export function getBrowserSupabase() {
  return createClient();
}
