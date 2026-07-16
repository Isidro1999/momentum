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
import { getTodayDateString } from "@/lib/dates";
import { toUserFacingError } from "@/lib/repositories/errors";
import * as dailyReviewRepository from "@/lib/repositories/daily-review-repository";
import type { DailyReview, DailyReviewInput } from "@/types";

interface OpenFormOptions {
  date?: string;
  lockDate?: boolean;
}

interface DailyReviewContextValue {
  reviews: DailyReview[];
  loading: boolean;
  error: string | null;
  isReady: boolean;
  retry: () => void;
  refresh: () => Promise<void>;
  getByDate: (date: string) => DailyReview | undefined;
  upsertReview: (input: DailyReviewInput) => Promise<DailyReview>;
  deleteReview: (id: string) => Promise<void>;
  isFormOpen: boolean;
  formDate: string;
  formDateLocked: boolean;
  editingReview: DailyReview | null;
  openCloseForm: (options?: OpenFormOptions) => void;
  openEditForm: (review: DailyReview) => void;
  closeForm: () => void;
}

const DailyReviewContext = createContext<DailyReviewContextValue | null>(null);

interface DailyReviewProviderProps {
  children: ReactNode;
}

export function DailyReviewProvider({ children }: DailyReviewProviderProps) {
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formDateLocked, setFormDateLocked] = useState(false);
  const [editingReview, setEditingReview] = useState<DailyReview | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dailyReviewRepository.listDailyReviews();
      setReviews(data);
    } catch (loadError) {
      setReviews([]);
      setError(toUserFacingError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const refresh = useCallback(async () => {
    await loadReviews();
  }, [loadReviews]);

  const getByDate = useCallback(
    (date: string) => reviews.find((review) => review.date === date),
    [reviews],
  );

  const upsertReview = useCallback(
    async (input: DailyReviewInput): Promise<DailyReview> => {
      const saved = await dailyReviewRepository.upsertDailyReview(input);
      setReviews((current) => {
        const exists = current.some((review) => review.id === saved.id);
        if (exists) {
          return current.map((review) =>
            review.id === saved.id ? saved : review,
          );
        }

        return [saved, ...current.filter((review) => review.date !== saved.date)];
      });
      return saved;
    },
    [],
  );

  const deleteReview = useCallback(async (id: string) => {
    await dailyReviewRepository.deleteDailyReview(id);
    setReviews((current) => current.filter((review) => review.id !== id));
  }, []);

  const openCloseForm = useCallback(
    (options?: OpenFormOptions) => {
      const date = options?.date ?? getTodayDateString();
      const existing = reviews.find((review) => review.date === date) ?? null;

      setFormDate(date);
      setFormDateLocked(options?.lockDate ?? false);
      setEditingReview(existing);
      setIsFormOpen(true);
    },
    [reviews],
  );

  const openEditForm = useCallback((review: DailyReview) => {
    setFormDate(review.date);
    setFormDateLocked(false);
    setEditingReview(review);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingReview(null);
    setFormDateLocked(false);
  }, []);

  const value = useMemo(
    () => ({
      reviews,
      loading,
      error,
      isReady: !loading && error === null,
      retry,
      refresh,
      getByDate,
      upsertReview,
      deleteReview,
      isFormOpen,
      formDate,
      formDateLocked,
      editingReview,
      openCloseForm,
      openEditForm,
      closeForm,
    }),
    [
      reviews,
      loading,
      error,
      retry,
      refresh,
      getByDate,
      upsertReview,
      deleteReview,
      isFormOpen,
      formDate,
      formDateLocked,
      editingReview,
      openCloseForm,
      openEditForm,
      closeForm,
    ],
  );

  return (
    <DailyReviewContext.Provider value={value}>
      {children}
    </DailyReviewContext.Provider>
  );
}

export function useDailyReviews(): DailyReviewContextValue {
  const context = useContext(DailyReviewContext);

  if (!context) {
    throw new Error("useDailyReviews debe usarse dentro de DailyReviewProvider");
  }

  return context;
}
