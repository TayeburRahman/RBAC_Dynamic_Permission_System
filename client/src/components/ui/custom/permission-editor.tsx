"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, Save, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthContext } from "@/providers/auth-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface PermissionEditorProps {
  userId: string | null;
  userName: string | null;
  onClose: () => void;
}

export default function PermissionEditor({ userId, userName, onClose }: PermissionEditorProps) {
  const auth = useAuthContext();
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [allRes, userRes] = await Promise.all([
          api.get("/permissions"),
          api.get(`/user-permissions/${userId}`),
        ]);
        setAllPermissions(allRes.data.data);
        setUserPermissions(userRes.data.data);
      } catch (err) {
        toast.error("Failed to load permission data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const togglePermission = (key: string) => {
    // Grant Ceiling Check: can't toggle what you don't have (unless Super Admin)
    const canToggle = auth?.user?.role === "SUPER_ADMIN" || auth?.hasPermission(key);
    
    if (!canToggle) {
      toast.warning("Grant Ceiling Restricted: You cannot assign permissions you do not possess yourself.");
      return;
    }

    setUserPermissions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await api.put(`/user-permissions/${userId}`, { permissions: userPermissions });
      toast.success("Permissions updated successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <SheetTitle>Manage Security</SheetTitle>
              <SheetDescription>Editing permissions for <span className="text-primary font-medium">{userName}</span></SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-6 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                <p className="text-sm text-muted-foreground">Synchronizing permission atoms...</p>
              </div>
            ) : (
              allPermissions.map((perm) => {
                const isAssigned = userPermissions.includes(perm.key);
                const isRestricted = auth?.user?.role !== "SUPER_ADMIN" && !auth?.hasPermission(perm.key);

                return (
                  <div 
                    key={perm.key} 
                    className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all ${
                      isRestricted ? "bg-muted/30 opacity-60 cursor-not-allowed" : "hover:bg-accent/50 group"
                    }`}
                  >
                    <div className="flex flex-col gap-1 pr-6 flex-1">
                      <Label htmlFor={perm.key} className="text-sm font-semibold cursor-pointer group-hover:text-primary transition-colors flex items-center gap-2">
                        {perm.label}
                        {isRestricted && <Shield className="h-3 w-3 text-muted-foreground" />}
                      </Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {perm.description}
                      </p>
                    </div>
                    <Switch
                      id={perm.key}
                      checked={isAssigned}
                      onCheckedChange={() => togglePermission(perm.key)}
                      disabled={isRestricted || saving}
                      className="mt-0.5"
                    />
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-3 pt-4 border-t mt-auto -mx-6 px-6 pb-6">
          <Button variant="outline" className="flex-1 gap-2 rounded-xl h-11" onClick={onClose}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button 
            className="flex-1 gap-2 rounded-xl h-11 shadow-lg shadow-primary/20" 
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
