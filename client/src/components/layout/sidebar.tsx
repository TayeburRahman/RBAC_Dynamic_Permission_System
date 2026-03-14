"use client";

import {
  LayoutGrid,
  Users,
  Target,
  CheckSquare,
  BarChart3,
  ClipboardList,
  Settings,
  Shield,
  LogOut,
  LucideIcon,
  Menu,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/providers/auth-provider";
import { useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  permission: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard",    icon: LayoutGrid,    href: "/dashboard",   permission: "view_dashboard"    },
  { name: "Users",        icon: Users,         href: "/users",       permission: "manage_users"      },
  { name: "Leads",        icon: Target,        href: "/leads",       permission: "manage_leads"      },
  { name: "Tasks",        icon: CheckSquare,   href: "/tasks",       permission: "manage_tasks"      },
  { name: "Reports",      icon: BarChart3,     href: "/reports",     permission: "view_reports"      },
  { name: "Audit Log",    icon: ClipboardList, href: "/audit-log",   permission: "view_audit_logs"   },
  { name: "Tickets",      icon: MessageSquare, href: "/tickets",     permission: "view_tickets"      },
  { name: "Orders",       icon: ShoppingBag,   href: "/orders",      permission: "view_orders"       },
  { name: "Settings",     icon: Settings,      href: "/settings",    permission: "manage_settings"   },
];

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}) => {
  const pathname = usePathname();
  const auth = useAuthContext();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, setIsSidebarOpen]);

  const handleLogout = async () => {
    await auth?.logout();
    window.location.href = '/auth/login';
  };

  const visibleItems = NAV_ITEMS.filter(item => auth?.hasPermission(item.permission));

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-sidebar w-64 transition-transform duration-300 ease-in-out transform flex flex-col border-r",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
    >
      {/* Brand */}
      <div className="flex flex-col items-start justify-center pl-6 border-b h-20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-base leading-none">RBAC System</p>
            <p className="text-xs text-muted-foreground mt-0.5">Permission Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-3">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}

          {visibleItems.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No accessible modules
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* User profile + logout */}
      <div className="border-t p-4 space-y-3">
        {auth?.user && (
          <div className="flex items-center gap-3 px-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(auth.user.name || auth.user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{auth.user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{auth.user.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
