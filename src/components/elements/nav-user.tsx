import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  Settings2Icon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";
import LogoutButton from "./logout-button";

function getInitials(name: string) {
  const words = name.split(" ");
  let initials = "";
  words.forEach((word, index) => {
    initials += word[0].toUpperCase();
  });
  return initials;
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data, status } = useSession();

  const user = data?.user;

  if (status === "loading") return <Skeleton className="w-full h-full" />;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={user?.image ?? undefined}
                  alt={user?.name ?? undefined}
                />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user?.name ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.name ?? undefined}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email ?? undefined}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.image ?? undefined}
                    alt={user?.name ?? undefined}
                  />
                  <AvatarFallback className="rounded-lg">{getInitials(user?.name ?? "")}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.name ?? undefined}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email ?? undefined}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Settings2Icon />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <LogoutButton>
            <DropdownMenuItem variant="destructive">
              <LogoutButton>
                <>
                  <LogOutIcon />
                  Log out
                </>
              </LogoutButton>
            </DropdownMenuItem>
            </LogoutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
