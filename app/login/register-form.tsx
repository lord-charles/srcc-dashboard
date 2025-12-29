"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  CreditCard,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  quickRegister,
  quickCompanyRegister,
} from "@/services/consultant.service";
import { Spinner } from "@/components/ui/spinner";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegistrationSuccess: (data: {
    email: string;
    password?: string;
    type: RegistrationType;
  }) => void;
}

type RegistrationType = "user" | "organization";

export function RegisterForm({
  onSwitchToLogin,
  onRegistrationSuccess,
}: RegisterFormProps) {
  const [registrationType, setRegistrationType] =
    useState<RegistrationType>("user");
  const [formData, setFormData] = useState({
    // Individual
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    // Company
    businessEmail: "",
    businessPhone: "",
    registrationNumber: "",
    kraPin: "",
    // Common
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (registrationType === "user") {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
      if (!formData.phoneNumber)
        newErrors.phoneNumber = "Phone number is required";
      if (!formData.nationalId)
        newErrors.nationalId = "National ID is required";
    } else {
      if (!formData.businessEmail)
        newErrors.businessEmail = "Business email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.businessEmail))
        newErrors.businessEmail = "Email is invalid";
      if (!formData.businessPhone)
        newErrors.businessPhone = "Business phone is required";
      if (!formData.registrationNumber)
        newErrors.registrationNumber = "Registration number is required";
      if (!formData.kraPin) newErrors.kraPin = "KRA PIN is required";
    }

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (registrationType === "user") {
        const {
          confirmPassword,
          businessEmail,
          businessPhone,
          registrationNumber,
          kraPin,
          ...registerData
        } = formData;
        await quickRegister(registerData);
        onRegistrationSuccess({
          email: formData.email,
          password: formData.password,
          type: "user",
        });
      } else {
        const {
          confirmPassword,
          firstName,
          lastName,
          email,
          phoneNumber,
          nationalId,
          ...registerData
        } = formData;
        await quickCompanyRegister(registerData);
        onRegistrationSuccess({
          email: formData.businessEmail,
          password: formData.password,
          type: "organization",
        });
      }
    } catch (error: any) {
      setErrors({ general: error.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-lg rounded-lg">
      <Tabs
        value={registrationType}
        onValueChange={(value) =>
          setRegistrationType(value as RegistrationType)
        }
        className="w-full"
      >
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">
            Create an Account
          </CardTitle>
          <CardDescription className="text-sm mt-2">
            Choose your account type and fill in the details.
          </CardDescription>
          <TabsList className="grid w-full grid-cols-2 mx-auto mt-4 max-w-xs">
            <TabsTrigger value="user">Individual</TabsTrigger>
            <TabsTrigger value="organization">Company</TabsTrigger>
          </TabsList>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <TabsContent value="user">
            <CardContent className="space-y-2">
              {errors.general && (
                <Alert variant="destructive" className="col-span-2">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+254712345678"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nationalId"
                      name="nationalId"
                      placeholder="12345678"
                      value={formData.nationalId}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.nationalId && (
                    <p className="text-sm text-destructive">
                      {errors.nationalId}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="organization">
            <CardContent className="space-y-2">
              {errors.general && (
                <Alert variant="destructive" className="col-span-2">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
                {errors.businessEmail && (
                  <p className="text-sm text-destructive">
                    {errors.businessEmail}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessPhone"
                      name="businessPhone"
                      type="tel"
                      placeholder="+254798765432"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.businessPhone && (
                    <p className="text-sm text-destructive">
                      {errors.businessPhone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration No.</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    placeholder="BN-XYZ123"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                  {errors.registrationNumber && (
                    <p className="text-sm text-destructive">
                      {errors.registrationNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kraPin">KRA PIN</Label>
                <Input
                  id="kraPin"
                  name="kraPin"
                  placeholder="A123456789Z"
                  value={formData.kraPin}
                  onChange={handleChange}
                />
                {errors.kraPin && (
                  <p className="text-sm text-destructive">{errors.kraPin}</p>
                )}
              </div>
            </CardContent>
          </TabsContent>

          {/* Common Fields: Password and Confirm Password */}
          <CardContent className="space-y-2 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  <h3>Creating Account...</h3>
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="flex items-center text-sm"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Tabs>
    </Card>
  );
}
