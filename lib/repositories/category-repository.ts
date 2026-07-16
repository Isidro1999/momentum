import {
  categoryNameFromSlug,
  slugFromCategoryName,
} from "@/lib/category-slugs";
import { RepositoryError, toUserFacingError } from "@/lib/repositories/errors";
import {
  getBrowserSupabase,
  requireUserId,
} from "@/lib/repositories/session";
import type { CategoryRow } from "@/types/database";
import type { TaskCategory } from "@/types";

export type Category = {
  id: string;
  name: TaskCategory;
  slug: string;
  position: number;
};

function mapCategory(row: CategoryRow): Category | null {
  const name = categoryNameFromSlug(row.slug) ?? (row.name as TaskCategory);
  if (!name) {
    return null;
  }

  return {
    id: row.id,
    name,
    slug: row.slug,
    position: row.position,
  };
}

export async function listCategories(): Promise<Category[]> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select(
        "id, user_id, name, slug, color, icon, position, created_at, updated_at",
      )
      .eq("user_id", userId)
      .order("position", { ascending: true });

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return (data as CategoryRow[])
      .map(mapCategory)
      .filter((item): item is Category => item !== null);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export function buildCategoryMaps(categories: Category[]): {
  idByName: Map<TaskCategory, string>;
  nameById: Map<string, TaskCategory>;
  idBySlug: Map<string, string>;
} {
  const idByName = new Map<TaskCategory, string>();
  const nameById = new Map<string, TaskCategory>();
  const idBySlug = new Map<string, string>();

  for (const category of categories) {
    idByName.set(category.name, category.id);
    nameById.set(category.id, category.name);
    idBySlug.set(category.slug, category.id);
  }

  return { idByName, nameById, idBySlug };
}

export function resolveCategoryId(
  categories: Category[],
  name: TaskCategory,
): string | null {
  const slug = slugFromCategoryName(name);
  const bySlug = categories.find((category) => category.slug === slug);
  if (bySlug) {
    return bySlug.id;
  }

  const byName = categories.find((category) => category.name === name);
  return byName?.id ?? null;
}

export function resolveCategoryName(
  categories: Category[],
  categoryId: string | null,
): TaskCategory {
  if (!categoryId) {
    return "Personal";
  }

  const found = categories.find((category) => category.id === categoryId);
  return found?.name ?? "Personal";
}
