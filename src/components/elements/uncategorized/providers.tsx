import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProfile } from "@/db/queries/profiles";
import { ProfileProvider } from "@/lib/profile-context";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function Providers({
  profile,
  session,
  children,
}: {
  profile?: UserProfile | undefined;
  session?: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <ProfileProvider profile={profile}>
        <Toaster richColors position="bottom-right" />
        <TooltipProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          {children}
        </SidebarProvider>
        </TooltipProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}
