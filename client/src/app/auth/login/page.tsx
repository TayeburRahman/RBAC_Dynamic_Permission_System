
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
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
      .then(() => {
        toast.success("Logged in successfully!")
        router.push('/dashboard')
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
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-112.5 p-8">
        <div className="flex flex-col items-center space-y-4 text-center">

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sign in to continue</p>
          </div>
        </div>

        <div className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm">
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="grid gap-4">
              <FormField
                control={emailForm.control}
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
                      <Input placeholder="name@example.com" {...field} disabled={isLoading} aria-invalid={fieldState.invalid} autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem data-invalid={fieldState.invalid}>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isLoading} placeholder="Enter your password" aria-invalid={fieldState.invalid} autoComplete="current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">Don't have an account? <Link href="/auth/register" className="font-semibold text-primary hover:underline underline-offset-4">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
} 
