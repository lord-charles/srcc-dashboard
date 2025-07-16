import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#1B4D3E] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">About SRCC</h3>
            <p className="text-sm text-gray-300">
              Strathmore Research and Consultancy Centre provides professional consulting services and innovative
              solutions to businesses and organizations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/about" className="hover:text-[#B7BE00]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#B7BE00]">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#B7BE00]">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#B7BE00]">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Ole Sangale Road, Madaraka</li>
              <li>P.O. Box 59857-00200</li>
              <li>Nairobi, Kenya</li>
              <li>info@strathmore.edu</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-[#B7BE00]">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-[#B7BE00]">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-[#B7BE00]">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-[#B7BE00]">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 mt-6 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} SRCC. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

