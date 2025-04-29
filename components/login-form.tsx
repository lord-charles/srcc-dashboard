"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const pin = formData.get("pin") as string;

    try {
      const result = await signIn("credentials", {
        email,
        pin,
        redirect: false,
      });

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
      console.error(error);
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
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Login to your account</h1>
        <p className="text-balance text-sm text-gray-300">
          Enter your credentials below to access your account
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pin" className="text-white">Pin</Label>
          <Input
            id="pin"
            name="pin"
            type="password"
            placeholder="Enter your pin"
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>

        <Button type='button' variant="outline" onClick={() => router.push("/consultant")}>
          Register
        </Button>
      </div>
    </form>
  );
}
