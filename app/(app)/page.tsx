import { TodayPageContent } from "@/components/today/today-page-content";
import { getCurrentUserProfile } from "@/lib/auth/profile";

export default async function HomePage() {
  const auth = await getCurrentUserProfile();

  return <TodayPageContent userName={auth?.displayName ?? "Usuario"} />;
}
