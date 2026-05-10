import { AppSidebar } from "@/components/elements/app-sidebar";
import { SiteHeader } from "@/components/elements/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AppRootLayout({ children }: React.PropsWithChildren) {
  const pathname = usePathname(); // e.g. "/transactions"

  const title = pathname
    .split("/")
    .filter(Boolean)        // removes empty parts
    .pop()                  // last segment
    ?.replace(/-/g, " ")    // optional: "user-settings" → "user settings"
    .replace(/\b\w/g, c => c.toUpperCase()) // capitalize
    ?? "Home";

  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
