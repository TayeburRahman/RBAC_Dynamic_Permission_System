/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Phone, Lock, User } from "lucide-react"
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

const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(6, { message: "Phone number must be at least 6 characters." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(8, { message: "Confirm password is required." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })


import { useAuthContext } from "@/providers/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuthContext();
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<any>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  })

  function onSubmit(values: any) {
    setIsLoading(true)
    auth?.register({
      name: values.name,
      email: values.email,
      phone_number: values.phone,
      password: values.password,
      confirmPassword: values.confirmPassword,
      termsAccepted: values.termsAccepted,
    })
      .then(() => {
        toast.success("Account created! Please verify your email.");
        router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);
      })
      .catch((err: any) => {
        const serverData = err?.response?.data;
        const msg = serverData?.message || err?.message || "Registration failed. Please try again.";
        
        // Check for field-specific errors from server
        if (serverData?.errorMessages && Array.isArray(serverData.errorMessages)) {
          serverData.errorMessages.forEach((error: any) => {
            if (error.path) {
              // Map phone_number from server to phone field in form if needed
              const fieldPath = error.path === "phone_number" ? "phone" : error.path;
              form.setError(fieldPath as any, { 
                type: "server",
                message: error.message 
              });
            }
          });
        }

        toast.error(msg);
        console.error("Registration Error:", err);
      })
      .finally(() => setIsLoading(false));
  }


  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 py-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-112.5 px-4">
        <div className="flex flex-col items-center space-y-2 text-center">
        
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Create Your Account</h1>
             
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border bg-card p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem data-invalid={fieldState.invalid}>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full name
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        {...field}
                        disabled={isLoading}
                        aria-invalid={fieldState.invalid}
                        autoComplete="name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem data-invalid={fieldState.invalid}>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        {...field} 
                        disabled={isLoading} 
                        aria-invalid={fieldState.invalid}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem data-invalid={fieldState.invalid}>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        {...field} 
                        disabled={isLoading} 
                        aria-invalid={fieldState.invalid}
                        autoComplete="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem data-invalid={fieldState.invalid}>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Create password" 
                        {...field} 
                        disabled={isLoading} 
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem data-invalid={fieldState.invalid}>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Confirm Password
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm password" 
                        {...field} 
                        disabled={isLoading} 
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4"
                      />
                      <label className="text-sm">I accept the terms and conditions</label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div> 
      </div>
    </div>
  )
}
