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
  const [togglingKeys, setTogglingKeys] = useState<string[]>([]);
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

  const togglePermission = async (key: string) => {
    // Grant Ceiling Check: can't toggle what you don't have (unless Super Admin)
    const canToggle = auth?.user?.role === "SUPER_ADMIN" || auth?.hasPermission(key);
    
    if (!canToggle) {
      toast.warning("Grant Ceiling Restricted: You cannot assign permissions you do not possess yourself.");
      return;
    }

    if (!userId) return;

    // Optimistic Update
    const newPermissions = userPermissions.includes(key) 
      ? userPermissions.filter(k => k !== key) 
      : [...userPermissions, key];
    
    // Set loading for this specific switch
    setTogglingKeys(prev => [...prev, key]);
    
    try {
      // Direct API update on toggle
      const response = await api.put(`/user-permissions/${userId}`, { permissions: newPermissions });
      setUserPermissions(response.data.data);
      toast.success(userPermissions.includes(key) ? "Permission revoked" : "Permission granted", {
        duration: 2000,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update permission");
    } finally {
      setTogglingKeys(prev => prev.filter(k => k !== key));
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
          <div className="py-6 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                <p className="text-sm text-muted-foreground">Synchronizing permission atoms...</p>
              </div>
            ) : (
              Object.entries(
                allPermissions.reduce((acc: any, perm) => {
                  const cat = perm.category || "General";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(perm);
                  return acc;
                }, {})
              ).map(([category, perms]: [string, any]) => (
                <div key={category} className="space-y-4">
                  <div className="px-1 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{category}</h3>
                  </div>
                  <div className="space-y-3">
                    {perms.map((perm: any) => {
                      const isAssigned = userPermissions.includes(perm.key);
                      const isRestricted = auth?.user?.role !== "SUPER_ADMIN" && !auth?.hasPermission(perm.key);
                      const isToggling = togglingKeys.includes(perm.key);

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
                          {isToggling ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary/50 mt-1 mr-2" />
                          ) : (
                            <Switch
                              id={perm.key}
                              checked={isAssigned}
                              onCheckedChange={() => togglePermission(perm.key)}
                              disabled={isRestricted || isToggling}
                              className="mt-0.5"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-3 pt-4 border-t mt-auto -mx-6 px-6 pb-6">
          <Button className="w-full gap-2 rounded-xl h-11 shadow-lg" onClick={onClose}>
            <Save className="h-4 w-4" /> Finish Editing
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
