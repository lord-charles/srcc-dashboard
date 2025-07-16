"use client";

import { useState, useRef } from "react"; // Added useRef
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { PasswordResetForm } from "./password-reset-form";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"form"> {
  onSwitchToRegister: () => void;
}

export function LoginForm({
  className,
  onSwitchToRegister,
  ...props
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log(result);

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid credentials. Please try again.",
        });
        return;
      }

      router.push("/analytics");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={onSubmit}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-white">
            Login to your account
          </h1>
          <p className="text-balance text-sm text-white/80">
            Enter your credentials below to access your account
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              placeholder="Enter your Email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm h-auto text-white hover:text-white/80"
                onClick={() => setShowPasswordReset(true)}
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your Password"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSwitchToRegister}
          >
            Register
          </Button>
        </div>
      </form>

      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
          </DialogHeader>
          <PasswordResetForm
            onClose={() => setShowPasswordReset(false)}
            initialEmail={emailInputRef.current?.value}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
