"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinkStyle } from "@/utils/styles";
import { DisconnectCurrentDevice, DisconnectAllDevices, DisconnectAllExceptOne } from "@/actions/accountLogout";

const navLinks = [
  { name: "Home", href: "/" },
];

const logoutOptions = [
  { name: "Logout Current Device", action: "current" },
  { name: "Logout All Devices", action: "all" },
  { name: "Logout Others", action: "except" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is on auth pages
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signUPnormal";

  useEffect(() => {
    // Check for auth token in cookies
    const checkAuth = () => {
      const cookies = document.cookie;
      const hasToken = cookies.includes("authToken");
      setIsAuthenticated(hasToken);
    };

    checkAuth();

    // Listen for cookie changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle logout
  const handleLogout = async (action: string) => {
    setIsLoading(true);

    try {
      let result;
      switch (action) {
        case "current":
          result = await DisconnectCurrentDevice();
          break;
        case "all":
          result = await DisconnectAllDevices();
          break;
        case "except":
          result = await DisconnectAllExceptOne();
          break;
      }

      if (result?.success) {
        setIsAuthenticated(false);
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  // Don't render header on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 h-16 w-full items-stretch justify-stretch border-b border-gray-200 bg-orange-500 backdrop-blur-md dark:border-gray-800 dark:bg-orange-600">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-gray-100 transition-colors hover:text-gray-50 dark:text-gray-100 dark:hover:text-gray-50"
        >
          <span>Bob Money Check</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex ml-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkStyle(isActive)}
              >
                {link.name}
              </Link>
            );
          })}

          {/* 3 Dots Menu - Always visible */}
          <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                >
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 dark:border-gray-700">
                    Account
                  </div>
                  {logoutOptions.map((option) => (
                    <button
                      key={option.action}
                      onClick={() => handleLogout(option.action)}
                      disabled={isLoading}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      {isLoading ? "Processing..." : option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-200 bg-white px-4 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-950 md:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {link.name === "Home" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                )}
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* Mobile 3 Dots Menu - Always visible */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
            <span>More</span>
          </button>
        </nav>

        {/* Mobile Dropdown Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMenuOpen(false)}>
            <div
              className="absolute bottom-20 right-4 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 dark:border-gray-700">
                Account
              </div>
              {logoutOptions.map((option) => (
                <button
                  key={option.action}
                  onClick={() => handleLogout(option.action)}
                  disabled={isLoading}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {isLoading ? "Processing..." : option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
