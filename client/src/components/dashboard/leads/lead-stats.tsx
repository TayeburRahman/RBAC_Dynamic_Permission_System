import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, Send, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Total Leads",
    value: "5",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "New Inquiries",
    value: "2",
    icon: Mail,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Quotes Sent",
    value: "1",
    icon: Send,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Won Deals",
    value: "1",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

export function LeadStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
                {stat.title}
              </p>
              <h3 className={`text-3xl font-bold tracking-tight ${stat.color}`}>
                {stat.value}
              </h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
