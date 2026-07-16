export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  }
}

export function toUserFacingError(_error: unknown): string {
  if (_error instanceof RepositoryError) {
    return _error.message;
  }

  return "No se pudieron sincronizar los datos. Intentá de nuevo.";
}
