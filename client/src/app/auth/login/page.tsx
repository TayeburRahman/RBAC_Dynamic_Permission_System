
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Shield } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useAuthContext } from "@/providers/auth-provider";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuthContext();
  const [isLoading, setIsLoading] = React.useState(false)

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema as any),
    defaultValues: { email: "", password: "" },
  })

  function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    setIsLoading(true)
    auth?.login(values.email, values.password)
      .then((redirectPath) => {
        toast.success("Logged in successfully!")
        router.push(redirectPath || '/dashboard')
      })
      .catch((err: any) => {
        const serverData = err?.response?.data;
        const msg = serverData?.message || err?.message || "Something went wrong. Please try again.";

        // Check for field-specific errors from server
        if (serverData?.errorMessages && Array.isArray(serverData.errorMessages)) {
          serverData.errorMessages.forEach((error: any) => {
            if (error.path) {
              emailForm.setError(error.path as any, {
                type: "server",
                message: error.message
              });
            }
          });
        }

        // If account is not activated, redirect user to verify page with email prefilled
        if (msg && String(msg).toLowerCase().includes('activate')) {
          toast.warning(msg);
          router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);
        } else {
          toast.error(msg);
          console.error("Login Error:", err);
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Shield className="h-6 w-6" />
              </div>
              <div className="flex flex-col text-left">
                <p className="font-black text-xl leading-none tracking-tight italic">RBAC SYSTEM</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-1">Permission Platform</p>
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground font-medium">Please enter your details to sign in</p>
        </div>

        <div className="bg-card border rounded-[32px] p-6 md:p-8 shadow-sm">
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-1">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="name@example.com"
                          className="h-12 pl-11 focus:border-primary transition-all rounded-2xl"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="font-bold italic" />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-1">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 focus:border-primary transition-all rounded-2xl"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="font-bold italic" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-[14px] font-black uppercase tracking-widest rounded-2xl bg-primary hover:bg-primary/90 text-white hover:text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Don't have an account?{" "}
              <Link href="/auth/register" className="font-bold text-primary hover:underline underline-offset-4">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
