import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  name: string | null;
  created_at: string;
};

export type AuthContext = {
  user: User;
  profile: Profile | null;
  displayName: string;
  categoriesReady: boolean;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function resolveDisplayName(
  profile: Profile | null,
  user: User,
): string {
  const profileName = profile?.name?.trim();
  if (profileName) {
    return profileName;
  }

  const metaName = user.user_metadata?.name;
  if (typeof metaName === "string" && metaName.trim()) {
    return metaName.trim();
  }

  const emailLocal = user.email?.split("@")[0]?.trim();
  if (emailLocal) {
    return emailLocal;
  }

  return "Usuario";
}

async function fetchProfile(
  userId: string,
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function countUserCategories(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error || count === null) {
    return 0;
  }

  return count;
}

/**
 * Loads the authenticated user + profile.
 * Retries once briefly if the signup trigger has not finished yet.
 */
export const getCurrentUserProfile = cache(
  async (): Promise<AuthContext | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    let profile = await fetchProfile(user.id);
    let categoryCount = profile ? await countUserCategories(user.id) : 0;

    if (!profile || categoryCount < 6) {
      await sleep(600);
      profile = (await fetchProfile(user.id)) ?? profile;
      categoryCount = await countUserCategories(user.id);
    }

    return {
      user,
      profile,
      displayName: resolveDisplayName(profile, user),
      categoriesReady: categoryCount >= 6,
    };
  },
);
