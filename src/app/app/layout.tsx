import { AppSidebar } from "@/components/elements/app-sidebar";
import { SiteHeader } from "@/components/elements/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { ProfileProvider } from "@/lib/profile-context";
import { getUserProfile, UserProfile } from "@/db/queries/profiles";
import { capitalize } from "@/lib/utils";

export default async function AppRootLayout({
  children,
}: React.PropsWithChildren) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const session = await auth();

  let profile;
  try {
    if(session?.user?.id) {
      const partialProfile = await getUserProfile(session.user.id)
      profile = { ...partialProfile, budget: Number(partialProfile.budget) } as UserProfile;
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
    <SessionProvider session={session}>
      <ProfileProvider profile={profile}>
        <Toaster richColors position="bottom-right" />
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader title={`${capitalize(title)}`} />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}
