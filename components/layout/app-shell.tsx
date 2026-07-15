import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { StorageRecoveryBanner } from "@/components/layout/storage-recovery-banner";
import { GoalFormModal } from "@/components/goals/goal-form-modal";
import { DailyReviewFormModal } from "@/components/journal/daily-review-form-modal";
import { TaskFormModal } from "@/components/tasks/task-form-modal";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-full bg-slate-100 text-slate-900">
      <AppSidebar />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <StorageRecoveryBanner />
          {children}
        </main>
      </div>
      <MobileNavigation />
      <TaskFormModal />
      <GoalFormModal />
      <DailyReviewFormModal />
    </div>
  );
}
