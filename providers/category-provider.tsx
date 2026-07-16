"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  listCategories,
  type Category,
} from "@/lib/repositories/category-repository";
import { toUserFacingError } from "@/lib/repositories/errors";
import type { TaskCategory } from "@/types";

interface CategoryContextValue {
  categories: Category[];
  loading: boolean;
  error: string | null;
  isReady: boolean;
  retry: () => void;
  getCategoryId: (name: TaskCategory) => string | null;
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await listCategories();
        if (!cancelled) {
          setCategories(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setCategories([]);
          setError(toUserFacingError(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const getCategoryId = useCallback(
    (name: TaskCategory) =>
      categories.find((category) => category.name === name)?.id ?? null,
    [categories],
  );

  const value = useMemo(
    () => ({
      categories,
      loading,
      error,
      isReady: !loading && error === null,
      retry,
      getCategoryId,
    }),
    [categories, loading, error, retry, getCategoryId],
  );

  return (
    <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
  );
}

export function useCategories(): CategoryContextValue {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories debe usarse dentro de CategoryProvider");
  }
  return context;
}
