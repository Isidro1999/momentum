import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { LogoutButton } from "@/components/layout/logout-button";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { StorageRecoveryBanner } from "@/components/layout/storage-recovery-banner";
import { GoalFormModal } from "@/components/goals/goal-form-modal";
import { DailyReviewFormModal } from "@/components/journal/daily-review-form-modal";
import { TaskFormModal } from "@/components/tasks/task-form-modal";

interface AppShellProps {
  children: ReactNode;
  userName: string;
}

export function AppShell({ children, userName }: AppShellProps) {
  return (
    <div className="min-h-full bg-slate-100 text-slate-900">
      <AppSidebar userName={userName} />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 lg:hidden">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Sesión
              </p>
              <p className="truncate text-sm font-medium text-slate-800">
                {userName}
              </p>
            </div>
            <LogoutButton compact />
          </div>
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
