import { AppShell } from "@/components/layout/app-shell";
import { TasksPageContent } from "@/components/tasks/tasks-page-content";

export default function TasksPage() {
  return (
    <AppShell>
      <TasksPageContent />
    </AppShell>
  );
}
