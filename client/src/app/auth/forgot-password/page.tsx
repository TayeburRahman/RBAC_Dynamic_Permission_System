"use client";
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from 'sonner';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({ 
  email: z.string().email({ message: "Please enter a valid email address." }) 
});

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof schema>>({ 
    resolver: zodResolver(schema as any),
    defaultValues: { email: "" }
  });
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', values);
      toast.success('Check your email for reset code');
    } catch (e: any) {
      const serverData = e?.response?.data;
      const msg = serverData?.message || e?.message || 'Failed to send reset code. Please try again.';
      
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
      console.error("Forgot Password Error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-112.5 p-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>
        </div>

        <div className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input 
                        placeholder="name@example.com" 
                        {...field} 
                        disabled={loading} 
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full h-11" size="lg">
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
