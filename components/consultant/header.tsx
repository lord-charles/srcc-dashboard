import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-[#1B4D3E] text-white">
      <div className="container mx-auto px-4">
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
            <Link href="https://srcc.strathmore.edu/home/" className="hover:text-[#B7BE00]">
              Home
            </Link>
            <Link href="https://srcc.strathmore.edu/about-us/" className="hover:text-[#B7BE00]">
              About Us
            </Link>
            <Link href="https://srcc.strathmore.edu/our-services/" className="hover:text-[#B7BE00]">
              Our Services
            </Link>
            <Link href="https://srcc.strathmore.edu/contact-us/" className="hover:text-[#B7BE00]">
              Contact
            </Link>
          </nav>

          <Button variant="outline" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}

