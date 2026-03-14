"use client";

import { useEffect, useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/providers/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import { Camera, Mail, Phone, User, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const auth = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    if (auth?.user) {
      setFormData({
        name: auth.user.name || "",
        email: auth.user.email || "",
        phone_number: auth.user.phone_number || "",
      });
    }
  }, [auth?.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/auth/update-profile", formData);
      toast.success("Profile updated successfully");
      auth?.refreshUser(); // Assuming this exists or can be implemented
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequirePermission permission="view_profile">
      <DashboardPageLayout>
        <DashboardHeader
          title="Account Settings"
          description="Manage your personal information and security preferences."
        />

        <div className="max-w-4xl mx-auto mt-8 grid gap-8 md:grid-cols-3">
          {/* Sidebar / Avatar Section */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden pt-6">
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-accent shadow-sm">
                            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                {auth?.user?.name?.[0] || auth?.user?.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div className="text-center mt-4 pb-6">
                        <h3 className="font-bold text-lg">{auth?.user?.name || 'User'}</h3>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                            <ShieldCheck className="h-3 w-3 text-primary" /> {auth?.user?.role}
                        </p>
                    </div>
                </div>
                <div className="bg-accent/50 p-4 border-t">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">Account Status: Active</p>
                </div>
            </Card>

            <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3" disabled>
                    <Mail className="h-4 w-4" /> Change Password
                </Button>
            </div>
          </div>

          {/* Form Section */}
          <Card className="md:col-span-2 border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your basic contact details here.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="name" 
                                    className="pl-9" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="email" 
                                    type="email" 
                                    className="pl-9" 
                                    value={formData.email}
                                    disabled // Usually email is locked or needs verification
                                />
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="phone" 
                                    className="pl-9" 
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t">
                        <Button type="submit" loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    </RequirePermission>
  );
}
