"use client";

import { useState, useRef } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/auth-provider";
import { User, Mail, Shield, Lock, Save, Camera, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const auth = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(auth?.user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(auth?.user?.phone_number || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.patch("/auth/update-profile", {
        name,
        phone_number: phoneNumber,
      });
      toast.success("Profile information updated");
      if (auth?.refreshUser) await auth.refreshUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    setLoading(true);
    try {
      await api.patch("/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploading(true);
    try {
      const res = await api.patch("/auth/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Update local auth state if possible, or just refresh
      toast.success("Profile image updated");
      if (auth?.refreshUser) await auth.refreshUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <RequirePermission permission="view_dashboard">
      <DashboardPageLayout>
        <DashboardHeader
          title="Account Settings"
          description="Manage your profile, security preferences, and account configuration."
        />

        <div className="grid gap-8 mt-8 max-w-4xl">
          {/* Profile Section */}
          <Section 
            title="Profile Information" 
            description="Update your personal details and avatar."
            icon={User}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={auth?.user?.profile_image ? `${process.env.NEXT_PUBLIC_BASE_API}/${auth.user.profile_image}` : ""} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {auth?.user?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </div>

              <div className="grid gap-4 flex-1 w-full">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" defaultValue={auth?.user?.email} className="pl-10 h-11 opacity-60" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Input 
                        id="phone" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-11" 
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleUpdateProfile} disabled={loading} className="w-fit gap-2 h-11 px-6">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button> 
              </div>
            </div>
          </Section>

          {/* Security Section */}
          <Section 
            title="Security & Password" 
            description="Change your password regularly to keep your account safe."
            icon={Lock}
          >
            <div className="grid gap-6 max-w-2xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input 
                    id="current" 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input 
                      id="new" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input 
                      id="confirm" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleUpdatePassword} 
                disabled={loading || !oldPassword || !newPassword} 
                variant="default" 
                className="w-fit gap-2 h-11 px-6"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Update Password
              </Button>
            </div>
          </Section>

          {/* Role Section */}
          <Section 
            title="Account Level" 
            description="Your current permissions and organizational role."
            icon={Shield}
          >
            <div className="flex items-center gap-4 p-5 rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-bold capitalize text-foreground tracking-tight">
                  {auth?.user?.role.replace('_', ' ')}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  Access level managed by organization policy
                </p>
              </div>
            </div>
          </Section>
        </div>
      </DashboardPageLayout>
    </RequirePermission>
  );
}

function Section({ title, description, icon: Icon, children }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground font-medium">{description}</p>
        </div>
      </div>
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {children}
        </CardContent>
      </Card>
      {/* <Separator className="my-2" /> */}
    </div>
  );
}
