import Link from "next/link"
import { Phone } from "lucide-react"

const socialLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61574041978891&mibextid=wwXIfr&mibextid=wwXIfr",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
    ),
  },
  {
    name: "X",
    url: "https://x.com/VMFCoin",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/vmfcoin?igsh=MTJtcjl3Ym1jbm9qMA%3D%3D&utm_source=qr",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.659.388 3.678 1.37 2.697 2.352 2.437 3.464 2.379 4.745.012 8.332 0 8.741 0 12c0 3.259.012 3.668.07 4.948.058 1.281.318 2.393 1.299 3.374.981.981 2.093 1.241 3.374 1.299C8.332 23.988 8.741 24 12 24c3.259 0 3.668-.012 4.948-.07 1.281-.058 2.393-.318 3.374-1.299.981-.981 1.241-2.093 1.299-3.374.058-1.28.07-1.689.07-4.948 0-3.259-.012-3.668-.07-4.948-.058-1.281-.318-2.393-1.299-3.374-.981-.981-2.093-1.241-3.374-1.299C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/vmfcoin/",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
    ),
  },
  {
    name: "Farcaster",
    url: "https://farcaster.xyz/vmfcoin",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#181F2A"/>
        <path d="M7 18V10.5C7 8.01472 9.01472 6 11.5 6H12.5C14.9853 6 17 8.01472 17 10.5V18H15V12C15 10.8954 14.1046 10 13 10H11C9.89543 10 9 10.8954 9 12V18H7Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "BlueSky",
    url: "https://bsky.app/profile/vmfcoin.bsky.social",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 600 530" fill="currentColor"><path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/></svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="py-12 bg-slate-900 text-white" role="contentinfo">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0A1830] flex items-center justify-center">
                <div className="bg-[#1769c7] rounded-[18px] w-12 h-12 flex items-center justify-center">
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20VMF%20Logo-HJjs5zLNzX1i3UA7BdYWX0EPUg7eWR.png" alt="VMF Logo - Patriotic star with red and white stripes" className="w-9 h-9 object-contain" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white">Veterans & Military Families</span>
              </div>
            </div>
            <p className="text-gray-400 text-center md:text-left">Supporting Those Who Served</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-3">
              <Phone className="h-5 w-5 text-red-500" aria-hidden="true" />
              <span className="font-bold text-red-500">VETERANS CRISIS LINE</span>
            </div>
            <p className="text-center text-gray-300 mb-1">
              Call <a href="tel:988" className="font-bold underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded hover:text-red-400">988</a> and Press <span className="font-bold">1</span>
            </p>
            <p className="text-center text-gray-300">
              or Text <a href="sms:838255" className="font-bold underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded hover:text-red-400">838255</a>
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-3" role="list" aria-label="Social media links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={`Visit our ${social.name} page, opens in new tab`}
                  role="listitem"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Veterans & Military Families. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 