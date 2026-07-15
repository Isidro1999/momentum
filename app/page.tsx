import { AppShell } from "@/components/layout/app-shell";
import { TodayPageContent } from "@/components/today/today-page-content";

export default function HomePage() {
  return (
    <AppShell>
      <TodayPageContent />
    </AppShell>
  );
}
