"use client";
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/auth-provider';
import { Mail, ShieldCheck } from 'lucide-react';

const schema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  activation_code: z.string().length(6, { message: "OTP must be 6 digits." }),
});

function VerifyOTPContent() {
  const router = useRouter();
  const search = useSearchParams();
  const auth = useAuthContext();
  const prefillEmail = (search?.get('email') as string) || '';
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      email: prefillEmail,
      activation_code: "",
    },
  });

  React.useEffect(() => {
    if (prefillEmail) {
      form.setValue('email', prefillEmail);
    }
  }, [prefillEmail, form]);

  const [loading, setLoading] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    try {
      if (auth?.verify) {
        await auth.verify(values);
      }
      
      toast.success('Account verified successfully!');
      router.push('/dashboard');
    } catch (e: any) {
      const serverData = e?.response?.data;
      const msg = serverData?.message || e?.message || 'Verification failed. Please check the code and try again.';
      
      // Map server errors to form if applicable
      if (serverData?.errorMessages && Array.isArray(serverData.errorMessages)) {
        serverData.errorMessages.forEach((error: any) => {
          if (error.path) {
            form.setError(error.path as any, { 
              type: "server",
              message: error.message 
            });
          }
        });
      }

      toast.error(msg);
      console.error("Verification Error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    const email = form.getValues('email');
    if (!email) return toast.error('Email is required to resend OTP');
    
    setResendLoading(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('OTP resent — please check your email');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to resend OTP. Try again later.';
      toast.error(msg);
      console.error("Resend OTP Error:", err);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-112.5 p-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Verify Your Account</h1>
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit code to your email
            </p>
          </div>
        </div>

        <div className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </div>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          {...field}
                          disabled={!!prefillEmail || loading}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="name@example.com"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activation_code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-center space-y-4">
                    <FormLabel className="sr-only">Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        disabled={loading}
                        {...field}
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="rounded-md border-2 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                          <InputOTPSlot index={1} className="rounded-md border-2 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                          <InputOTPSlot index={2} className="rounded-md border-2 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                          <InputOTPSlot index={3} className="rounded-md border-2 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                          <InputOTPSlot index={4} className="rounded-md border-2 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                          <InputOTPSlot index={5} className="rounded-md border-2 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Account"}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={onResend}
                      disabled={resendLoading || loading}
                      className="font-semibold text-primary hover:underline underline-offset-4 disabled:opacity-50"
                    >
                      {resendLoading ? "Sending..." : "Resend Code"}
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </Form>
        </div>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <button className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <React.Suspense fallback={<div>Loading verify code page...</div>}>
      <VerifyOTPContent />
    </React.Suspense>
  );
}
