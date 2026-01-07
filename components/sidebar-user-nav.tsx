"use client";

import { ChevronUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs"; // Replace next-auth
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LoaderIcon } from "./icons";
import { PushNotificationManager } from "./push-notification-manager";

// Note: We removed the 'user' prop requirement because Clerk's useUser hook 
// is more reliable in client components.
export function SidebarUserNav() {
  const router = useRouter();
  const { user, isLoaded } = useUser(); // Clerk's loading state
  const { signOut } = useClerk(); // Clerk's sign out method
  const { setTheme, resolvedTheme } = useTheme();

  // If you still use the guest logic, Clerk users usually aren't guests, 
  // but we can keep the variable for compatibility.
  const isGuest = false; 

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-1">
        <PushNotificationManager />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {!isLoaded ? (
              <SidebarMenuButton className="h-10 flex-1 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex flex-row gap-2">
                  <div className="size-6 animate-pulse rounded-full bg-zinc-500/30" />
                  <span className="animate-pulse rounded-md bg-zinc-500/30 text-transparent">
                    Loading auth status
                  </span>
                </div>
                <div className="animate-spin text-zinc-500">
                  <LoaderIcon />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                className="h-10 flex-1 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                data-testid="user-nav-button"
              >
                <Image
                  alt={user?.primaryEmailAddress?.emailAddress ?? "User Avatar"}
                  className="rounded-full"
                  height={24}
                  src={user?.imageUrl ?? `https://avatar.vercel.sh/${user?.id}`}
                  width={24}
                />
                <span className="truncate" data-testid="user-email">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-popper-anchor-width)"
            data-testid="user-nav-menu"
            side="top"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="user-nav-item-theme"
              onSelect={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {`Toggle ${resolvedTheme === "light" ? "dark" : "light"} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                className="w-full cursor-pointer text-left"
                onClick={() => signOut(() => router.push("/"))}
                type="button"
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}