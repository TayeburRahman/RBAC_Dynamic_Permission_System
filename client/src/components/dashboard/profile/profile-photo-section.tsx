"use client";

import { useState, useRef } from "react";
import { Camera, X, User, Mail, Shield, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorToast, SuccessToast } from "@/lib/utils";

export function ProfilePhotoSection() {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        ErrorToast("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        SuccessToast("Photo uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Avatar Container */}
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl transition-transform duration-300 group-hover:scale-[1.02]">
              {image && <AvatarImage src={image} className="object-cover" />}
              <AvatarFallback className="bg-primary/5 text-primary">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>

            {image && (
              <button
                onClick={removeImage}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/90"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <div
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex-1 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h3 className="text-2xl font-semibold text-foreground">
                  Ubaid Kazmi
                </h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold w-fit mx-auto sm:mx-0">
                  <Shield className="h-3 w-3" />
                  Verified Vendor
                </div>
              </div>
              <div className="flex flex-col gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  ubaidkazmi@gmail.com
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined March 2024
                </div>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
