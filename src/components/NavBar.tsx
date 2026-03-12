"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Lumi Questions" },
  { href: "/dynamic-ob", label: "Dynamic Onboarding" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-1 h-12">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
