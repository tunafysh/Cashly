import { AppSidebar } from "@/components/elements/sidebar-stuff/app-sidebar";
import { SiteHeader } from "@/components/elements/uncategorized/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { ProfileProvider } from "@/lib/profile-context";
import { getUserProfile, UserProfile } from "@/db/queries/profiles";
import { capitalize } from "@/lib/utils";
import Providers from "@/components/elements/uncategorized/providers";

export default async function AppRootLayout({
  children,
}: React.PropsWithChildren) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const session = await auth();

  let profile: UserProfile | undefined;
  try {
    if (session?.user?.id) {
      const partialProfile = await getUserProfile(session.user.id);
      if (partialProfile) {
        profile = {
          ...partialProfile,
          budget: partialProfile.budget ? Number(partialProfile.budget) : null,
        };
      }
    }
  } catch (error) {
    console.error("Failed to load profile:", error);
  }

  const title =
    pathname
      .split("/")
      .filter(Boolean) // removes empty parts
      .pop() // last segment
      ?.replace(/-/g, " ") // optional: "user-settings" → "user settings"
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? // capitalize
    "Home";

  return (
    <Providers profile={profile} session={session}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={`${capitalize(title)}`} />
        {children}
      </SidebarInset>
    </Providers>
  );
}
