import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { DailyReviewProvider } from "@/providers/daily-review-provider";
import { GoalProvider } from "@/providers/goal-provider";
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
    <TaskProvider>
      <GoalProvider>
        <DailyReviewProvider>
          <AppShell userName={auth.displayName}>{children}</AppShell>
        </DailyReviewProvider>
      </GoalProvider>
    </TaskProvider>
  );
}
