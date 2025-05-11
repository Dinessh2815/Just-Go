"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [mainNavActive, setMainNavActive] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update mainNavActive when pathname changes
  useEffect(() => {
    // Find the matching nav item based on current pathname
    const activeItem = navItems.find((item) => pathname === item.href);
    if (activeItem) {
      setMainNavActive(activeItem.name.toLowerCase());
    } else {
      // Default to home if no match (or another appropriate default)
      setMainNavActive(pathname === "/" ? "home" : "");
    }
  }, [pathname]);

  const navItems = [
    { name: "HOME", href: "/home" },
    { name: "COMMUNITY", href: "/auth/community" },
  ];

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when a link is clicked
  const handleNavLinkClick = (itemName) => {
    setMainNavActive(itemName.toLowerCase());
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    // Only add event listener if menu is open
    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside, { once: true });
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="container mx-auto px-6 py-4 flex justify-between items-center relative z-50">
      <Link href="/home" className="text-white text-2xl font-bold tracking-wider">
        JUST GO
      </Link>
        {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`uppercase tracking-wider ${
              mainNavActive === item.name.toLowerCase()
                ? "text-white border-b-2 border-white pb-1"
                : "text-gray-100 hover:text-gray-200"
            }`}
            onClick={() => setMainNavActive(item.name.toLowerCase())}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Hamburger Button */}
      <button 
        className="md:hidden text-white focus:outline-none relative z-50"
        onClick={(e) => {
          e.stopPropagation();
          toggleMobileMenu();
        }}
        aria-label="Toggle mobile menu"
      >        <svg
          className="w-7 h-7"
          fill="none"
          stroke="white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {mobileMenuOpen ? (
            // X icon when menu is open
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            // Hamburger icon when menu is closed
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>      {/* Mobile Navigation Menu with Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Translucent blurry backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-in-out"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
          />
          
          {/* Mobile menu */}
          <div 
            className="md:hidden fixed top-[72px] right-0 left-0 bg-black border-t border-gray-700 animate-fade-in-down shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col">              {navItems.map((item) => (                <Link
                  key={item.name}
                  href={item.href}
                  className={`uppercase tracking-wider text-white text-center py-4 hover:bg-gray-800 transition-colors ${
                    mainNavActive === item.name.toLowerCase()
                      ? "border-l-4 border-white bg-gray-900"
                      : "hover:text-gray-200"
                  }`}
                  onClick={() => handleNavLinkClick(item.name)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
