import Image from "next/image";
import Link from "next/link";
import { Menu, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export default function Header() {
  const { setTheme } = useTheme();

  return (
    <header className="bg-[#1B4D3E] text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between h-30">
          <div className="flex items-center gap-2">
            <Image
              src="/srcc-logo.webp"
              alt="SRCC Logo"
              width={300}
              height={100}
              className="object-stretch"
            />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="https://srcc.strathmore.edu/home/"
              className="hover:text-[#B7BE00]"
            >
              Home
            </Link>
            <Link
              href="https://srcc.strathmore.edu/about-us/"
              className="hover:text-[#B7BE00]"
            >
              About Us
            </Link>
            <Link
              href="https://srcc.strathmore.edu/our-services/"
              className="hover:text-[#B7BE00]"
            >
              Our Services
            </Link>
            <Link
              href="https://srcc.strathmore.edu/contact-us/"
              className="hover:text-[#B7BE00]"
            >
              Contact
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <Button variant="outline" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
