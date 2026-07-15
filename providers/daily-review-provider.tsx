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
  loadDailyReviewsFromStorage,
  saveDailyReviewsToStorage,
} from "@/lib/daily-review-storage";
import { getTodayDateString } from "@/lib/dates";
import type { DailyReview, DailyReviewInput } from "@/types";

interface OpenFormOptions {
  date?: string;
  lockDate?: boolean;
}

interface DailyReviewContextValue {
  reviews: DailyReview[];
  isReady: boolean;
  storageCorrupt: boolean;
  recoverStorage: () => void;
  getByDate: (date: string) => DailyReview | undefined;
  upsertReview: (input: DailyReviewInput) => DailyReview;
  deleteReview: (id: string) => void;
  isFormOpen: boolean;
  formDate: string;
  formDateLocked: boolean;
  editingReview: DailyReview | null;
  openCloseForm: (options?: OpenFormOptions) => void;
  openEditForm: (review: DailyReview) => void;
  closeForm: () => void;
}

const DailyReviewContext = createContext<DailyReviewContextValue | null>(null);

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `review-${crypto.randomUUID()}`;
  }

  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface DailyReviewProviderProps {
  children: ReactNode;
}

export function DailyReviewProvider({ children }: DailyReviewProviderProps) {
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [storageCorrupt, setStorageCorrupt] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formDateLocked, setFormDateLocked] = useState(false);
  const [editingReview, setEditingReview] = useState<DailyReview | null>(null);

  useEffect(() => {
    const stored = loadDailyReviewsFromStorage();

    if (stored.status === "missing") {
      setReviews([]);
      setCanPersist(true);
      setStorageCorrupt(false);
    } else if (stored.status === "corrupt") {
      setReviews([]);
      setCanPersist(false);
      setStorageCorrupt(true);
    } else {
      setReviews(stored.data);
      setCanPersist(true);
      setStorageCorrupt(false);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !canPersist) {
      return;
    }

    saveDailyReviewsToStorage(reviews);
  }, [reviews, isReady, canPersist]);

  const recoverStorage = useCallback(() => {
    setReviews([]);
    saveDailyReviewsToStorage([]);
    setCanPersist(true);
    setStorageCorrupt(false);
  }, []);

  const getByDate = useCallback(
    (date: string) => reviews.find((review) => review.date === date),
    [reviews],
  );

  const upsertReview = useCallback((input: DailyReviewInput): DailyReview => {
    const now = new Date().toISOString();
    let result: DailyReview | null = null;

    setReviews((current) => {
      const existing = current.find((review) => review.date === input.date);
      const baseFields = {
        date: input.date,
        mood: input.mood,
        energy: input.energy,
        stress: input.stress,
        productivity: input.productivity,
        sleepHours: input.sleepHours,
        trained: input.trained,
        studied: input.studied,
        jobSearchProgress: input.jobSearchProgress,
        ifedelProgress: input.ifedelProgress,
        wentWell: input.wentWell.trim(),
        difficulties: input.difficulties.trim(),
        dailyWin: input.dailyWin.trim(),
        learning: input.learning.trim(),
        tomorrowPriority: input.tomorrowPriority.trim(),
        notes: input.notes?.trim() || undefined,
        updatedAt: now,
      };

      if (existing) {
        const updated: DailyReview = {
          ...existing,
          ...baseFields,
        };
        result = updated;
        return current.map((review) =>
          review.id === existing.id ? updated : review,
        );
      }

      const created: DailyReview = {
        id: createId(),
        ...baseFields,
        createdAt: now,
      };
      result = created;
      return [created, ...current];
    });

    if (!result) {
      throw new Error("No se pudo guardar el registro diario");
    }

    return result;
  }, []);

  const deleteReview = useCallback((id: string) => {
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
      isReady,
      storageCorrupt,
      recoverStorage,
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
      isReady,
      storageCorrupt,
      recoverStorage,
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
