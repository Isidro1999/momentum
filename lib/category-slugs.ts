import type { TaskCategory } from "@/types";

export const CATEGORY_SLUG_BY_NAME: Record<TaskCategory, string> = {
  Feater: "feater",
  "Búsqueda laboral": "busqueda-laboral",
  IFEDEL: "ifedel",
  Facultad: "facultad",
  Entrenamiento: "entrenamiento",
  Personal: "personal",
};

export const CATEGORY_NAME_BY_SLUG: Record<string, TaskCategory> = {
  feater: "Feater",
  "busqueda-laboral": "Búsqueda laboral",
  ifedel: "IFEDEL",
  facultad: "Facultad",
  entrenamiento: "Entrenamiento",
  personal: "Personal",
};

export function slugFromCategoryName(name: TaskCategory): string {
  return CATEGORY_SLUG_BY_NAME[name];
}

export function categoryNameFromSlug(slug: string): TaskCategory | null {
  return CATEGORY_NAME_BY_SLUG[slug] ?? null;
}
