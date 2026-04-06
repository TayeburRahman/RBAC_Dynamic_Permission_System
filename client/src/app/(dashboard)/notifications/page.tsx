"use client";

import React from "react";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import { useNotifications } from "@/providers/notification-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    CheckCheck, 
    Bell, 
    Trash2, 
    MessageSquare, 
    ClipboardList, 
    ShoppingBag, 
    AlertCircle,
    Inbox
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NotificationList = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_MESSAGE":
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case "TASK_ASSIGNED":
      case "TASK_STATUS_UPDATE":
        return <ClipboardList className="h-4 w-4 text-blue-500" />;
      case "ORDER_CREATED":
        return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      case "SYSTEM":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardPageLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <Bell className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Notifications</h1>
                    <p className="text-sm text-muted-foreground font-medium">Keep track of your workspace activity</p>
                </div>
            </div>
            {unreadCount > 0 && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-primary hover:text-primary hover:bg-primary/5 font-bold gap-2 rounded-xl"
                >
                    <CheckCheck className="h-4 w-4" />
                    Mark all as read
                </Button>
            )}
        </div>

        {notifications.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent shadow-none rounded-[32px] py-20">
                <CardContent className="flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6 ring-8 ring-muted/10">
                        <Inbox className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
                    <p className="text-muted-foreground max-w-xs text-sm font-medium">
                        When you get tasks, orders, or messages, they will appear here.
                    </p>
                </CardContent>
            </Card>
        ) : (
            <div className="space-y-4">
                {notifications.map((notif) => (
                    <Card 
                        key={notif._id} 
                        className={cn(
                            "group border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[28px] overflow-hidden",
                            notif.isRead ? "bg-card/50" : "bg-card ring-1 ring-primary/10"
                        )}
                    >
                        <CardContent className="p-0">
                            <div className="flex items-start gap-4 p-5">
                                <div className={cn(
                                    "mt-1 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center shadow-sm",
                                    notif.isRead ? "bg-muted/50 text-muted-foreground" : "bg-primary/10 text-primary"
                                )}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className={cn(
                                            "text-sm font-black truncate",
                                            notif.isRead ? "text-muted-foreground" : "text-foreground"
                                        )}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] whitespace-nowrap text-muted-foreground font-bold uppercase tracking-widest">
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-xs font-medium leading-relaxed mb-3",
                                        notif.isRead ? "text-muted-foreground/70" : "text-muted-foreground"
                                    )}>
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        {notif.link && (
                                            <Link href={notif.link}>
                                                <Button size="sm" variant="outline" className="h-8 px-4 text-[11px] font-black uppercase tracking-tighter rounded-xl bg-background hover:bg-primary hover:text-white border-primary/10 transition-all">
                                                    View Details
                                                </Button>
                                            </Link>
                                        )}
                                        {!notif.isRead && (
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => markAsRead(notif._id)}
                                                className="h-8 px-4 text-[11px] font-black uppercase tracking-tighter rounded-xl text-primary hover:bg-primary/5"
                                            >
                                                Dismiss
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {!notif.isRead && (
                                    <div className="h-2 w-2 rounded-full bg-primary mt-6 shrink-0 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </DashboardPageLayout>
  );
};

export default NotificationList;
