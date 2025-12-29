"use client";

import { useState, useRef } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginType = "user" | "organization";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onVerificationRequired: (email: string, loginType: LoginType) => void;
  setCredentials: (credentials: { email: string; password: string }) => void;
}

export function LoginForm({
  onSwitchToRegister,
  onVerificationRequired,
  setCredentials,
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>("user");
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
    setCredentials({ email, password });

    try {
      const result = await signIn("credentials", {
        email,
        password,
        type: loginType,
        redirect: false,
      });

      if (result?.error) {
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.code === "VERIFICATION_REQUIRED") {
            onVerificationRequired(email, loginType);
            return;
          }
        } catch (e) {
          // Error is not a JSON object, so handle as a plain string.
        }

        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error,
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
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <Tabs
          value={loginType}
          onValueChange={(value) => setLoginType(value as LoginType)}
          className="w-full"
        >
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-sm mt-2">
              Select your login type and enter your credentials.
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mx-auto mt-4 max-w-xs">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
            </TabsList>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {loginType === "user" ? "Email" : "Business Email"}
                </Label>
                <Input
                  ref={emailInputRef}
                  id="email"
                  name="email"
                  type="email"
                  placeholder={
                    loginType === "user"
                      ? "your@email.com"
                      : "contact@company.com"
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm h-auto"
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              <Button type="button" variant="link" onClick={onSwitchToRegister}>
                Don&apos;t have an account? Register
              </Button>
            </CardFooter>
          </form>
        </Tabs>
      </Card>

      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              Enter your email to receive a password reset link.
            </DialogDescription>
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
