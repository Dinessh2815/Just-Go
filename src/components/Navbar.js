"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [mainNavActive, setMainNavActive] = useState("home");

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "COMMUNITY", href: "/auth/community" },
    { name: "THINGS TO DO", href: "/auth/things-to-do" },
    { name: "EVENTS", href: "/auth/events" },
  ];

  return (
    <header className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-white text-2xl font-bold tracking-wider">
        JUST GO
      </Link>
      <nav className="hidden md:flex space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`text-white uppercase tracking-wider ${
              pathname === item.href ||
              mainNavActive === item.name.toLowerCase()
                ? "border-b-2 border-white pb-1"
                : ""
            }`}
            onClick={() => setMainNavActive(item.name.toLowerCase())}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
