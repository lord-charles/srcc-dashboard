import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/analytics");
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-[#31876d]">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="#"
            className="flex items-center justify-center "
          >
            <Image
              src="https://i0.wp.com/srcc.strathmore.edu/wp-content/uploads/2024/05/SRCC-White-Logo-White-01.png"
              alt="SRCC Logo"
              width={500}
              height={500}
              className="object-stretch"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
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
