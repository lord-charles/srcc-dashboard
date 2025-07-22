"use client";

import { useState } from "react";
import Image from "next/image";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { OTPVerificationForm } from "./otp-verification-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { VerificationHub } from "./verification-hub";
import { verifyOtp, verifyCompanyOtp } from "@/services/consultant.service";

type View =
  | "login"
  | "register"
  | "verification-hub"
  | "verify-email"
  | "verify-phone";
type UserType = "user" | "organization";

export default function LoginPage() {
  const [view, setView] = useState<View>("login");
  const [userType, setUserType] = useState<UserType>("user");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const router = useRouter();
  const { toast } = useToast();

  const handleSwitchToRegister = () => setView("register");
  const handleSwitchToLogin = () => setView("login");

  const handleVerificationRequired = (email: string, type: UserType) => {
    setUserType(type);
    setView("verification-hub");
  };

  const handleRegistrationSuccess = (data: {
    email: string;
    password?: string;
    type: UserType;
  }) => {
    // console.log(data);
    setCredentials({ email: data.email, password: data.password || "" });
    setUserType(data.type);
    setView("verification-hub");
  };

  const handleVerificationSuccess = () => {
    setView("verification-hub");
  };

  const handleBothVerified = async () => {
    toast({
      title: "Verification Complete!",
      description: "Logging you in...",
    });
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        type: userType,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description:
            "Verification successful, but login failed. Please try logging in manually.",
        });
        setView("login");
        return;
      }

      router.push("/analytics");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during login.",
      });
      setView("login");
    }
  };

  const renderForm = () => {
    switch (view) {
      case "register":
        return (
          <RegisterForm
            onSwitchToLogin={handleSwitchToLogin}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      case "verification-hub":
        return (
          <VerificationHub
            email={credentials.email}
            userType={userType}
            onVerifyEmail={() => setView("verify-email")}
            onVerifyPhone={() => setView("verify-phone")}
            onBackToLogin={handleSwitchToLogin}
            onBothVerified={handleBothVerified}
          />
        );
      case "verify-email":
        return (
          <OTPVerificationForm
            title="Verify Your Email"
            description={`We sent a 4-digit code to ${credentials.email}.`}
            onVerify={(pin) =>
              userType === "user"
                ? verifyOtp({
                    email: credentials.email,
                    pin,
                    verificationType: "email",
                  })
                : verifyCompanyOtp({
                    businessEmail: credentials.email,
                    pin,
                    verificationType: "email",
                  })
            }
            onSuccess={handleVerificationSuccess}
            onBack={() => setView("verification-hub")}
          />
        );
      case "verify-phone":
        return (
          <OTPVerificationForm
            title="Verify Your Phone Number"
            description="We sent a 4-digit code to your phone."
            onVerify={(pin) =>
              userType === "user"
                ? verifyOtp({
                    email: credentials.email,
                    pin,
                    verificationType: "phone",
                  })
                : verifyCompanyOtp({
                    businessEmail: credentials.email,
                    pin,
                    verificationType: "phone",
                  })
            }
            onSuccess={handleVerificationSuccess}
            onBack={() => setView("verification-hub")}
          />
        );
      case "login":
      default:
        return (
          <LoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onVerificationRequired={handleVerificationRequired}
            setCredentials={setCredentials}
          />
        );
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-0 p-6 md:p-10 bg-[#2e5650]">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center justify-center ">
            <Image
              src="https://i0.wp.com/srcc.strathmore.edu/wp-content/uploads/2024/05/SRCC-White-Logo-White-01.png"
              alt="SRCC Logo"
              width={400}
              height={400}
              className="object-stretch"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">{renderForm()}</div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image
          src="/login.jpg"
          alt="Login background"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5] "
        />
      </div>
    </div>
  );
}
