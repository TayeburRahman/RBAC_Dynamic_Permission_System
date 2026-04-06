"use client";

import { Menu, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ThemeToggle } from "../ui/custom/theme-toggle";
import { useAuthContext } from "@/providers/auth-provider";

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const auth = useAuthContext();
  const user = auth?.user;
  const isLoading = auth?.initializing;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 z-30 bg-sidebar border-b">
      <div className="relative h-full flex items-center justify-between px-4">
        {/* Left side: mobile menu or spacer */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Right: notification + theme toggle + profile */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Theme toggle */}
          <ThemeToggle variant="ghost" size="icon" className="h-9 w-9" />

          {/* Notification icon */}
          <Link href="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex items-center pl-2 border-l ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="hidden lg:flex flex-col gap-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={user?.profile_image ? `${process.env.NEXT_PUBLIC_BASE_API}/${user.profile_image}` : ""} alt={user?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:flex flex-col text-left">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                          {user?.role}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => auth?.logout()}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
