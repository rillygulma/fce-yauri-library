import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-red-900 text-white py-10 px-6">
      <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-3">
        
        {/* Logo & About */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/fce-logo.jpeg"
              alt="FCE Yauri Logo"
              width={50}
              height={50}
              className="rounded"
            />

            <h2 className="text-lg font-bold">
              FCE Yauri Library Complex
            </h2>
          </div>

          <p className="mt-4 text-sm leading-6 text-gray-200">
            Federal College of Education (Technical), Yauri Library supports teaching,
            learning, and research through quality information resources.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Quick Links
          </h3>

          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/history" className="hover:text-black">
                About Library
              </Link>
            </li>

            <li>
              <Link href="/services" className="hover:text-black">
                Services
              </Link>
            </li>

            <li>
              <Link href="/events" className="hover:text-black">
                News & Events
              </Link>
            </li>

            <li>
              <Link href="/contact-us" className="hover:text-black">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Contact
          </h3>

          <p className="text-sm text-gray-200">
            Federal College of Education (Technical), Yauri
          </p>

          <p className="text-sm text-gray-200">
            PMB 1025, Yauri
          </p>

          <p className="mt-2 text-sm text-gray-200">
            Email: library@fce.edu.ng
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-white/20 pt-5 text-center text-sm text-gray-200">
        © {new Date().getFullYear()} F.C.E (TECHNICAL), YAURI Library Complex. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;