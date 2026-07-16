import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { CategoryProvider } from "@/providers/category-provider";
import { DailyReviewProvider } from "@/providers/daily-review-provider";
import { GoalProvider } from "@/providers/goal-provider";
import { MigrationProvider } from "@/providers/migration-provider";
import { TaskProvider } from "@/providers/task-provider";

export default async function PrivateAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getCurrentUserProfile();

  if (!auth) {
    redirect("/login");
  }

  return (
    <CategoryProvider>
      <TaskProvider>
        <GoalProvider>
          <DailyReviewProvider>
            <MigrationProvider>
              <AppShell userName={auth.displayName}>{children}</AppShell>
            </MigrationProvider>
          </DailyReviewProvider>
        </GoalProvider>
      </TaskProvider>
    </CategoryProvider>
  );
}
