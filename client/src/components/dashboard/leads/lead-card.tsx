import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Eye,
  Send,
} from "lucide-react";
import Link from "next/link";

interface LeadCardProps {
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: "New" | "Quoted" | "Won" | "Lost";
    priority: "High" | "Medium" | "Low";
    eventDate: string;
    location: string;
    budget: string;
    guests: number;
    message: string;
    receivedDate: string;
  };
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <Card>
      {/* Top Section */}
      <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 rounded-full border-2 border-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">
              {lead.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground">{lead.name}</h3>
              <div className="flex gap-1.5">
                <Badge
                  variant={lead.status === "New" ? "info" : "warning"}
                  className="rounded-md px-2 py-0"
                >
                  {lead.status}
                </Badge>
                <Badge
                  variant={lead.priority === "High" ? "destructive" : "warning"}
                  className="rounded-md px-2 py-0"
                >
                  {lead.priority}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{lead.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Link href={`/vendor/dashboard/leads/${lead.id}`}>
            <Button variant="outline" size="sm">
              <Eye />
              View Details
            </Button>
          </Link>
          {lead.status === "New" && (
            <Link href={`/vendor/dashboard/leads/${lead.id}/create-quote`}>
              <Button size="sm">
                <Send />
                Send Quote
              </Button>
            </Link>
          )}
        </div>
      </CardContent>

      {/* Divider */}
      <div className="h-px bg-border mx-6" />

      {/* Info Grid */}
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Event Date
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {lead.eventDate}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Location
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {lead.location}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Budget
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <DollarSign className="h-4 w-4" />
            {lead.budget}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Guests
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-muted-foreground" />
            {lead.guests}
          </div>
        </div>
      </CardContent>

      {/* Message Section */}
      <CardContent className="bg-muted/5 space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Message
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed italic">
          &quot;{lead.message}&quot;
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
          <Clock className="h-3 w-3" />
          Received on {lead.receivedDate}
        </div>
      </CardContent>
    </Card>
  );
}
