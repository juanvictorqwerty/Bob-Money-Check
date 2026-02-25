"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinkStyle } from "@/utils/styles";
import { DisconnectCurrentDevice, DisconnectAllDevices, DisconnectAllExceptOne } from "@/actions/accountCommonFunctions";

const navLinks = [
  {name:"Account", href:"/Account"}
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

  // Check if user is on auth pages, noInternet page, or admin page
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signUPnormal";
  const isNoInternetPage = pathname === "/noInternet";
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isForgotPasswordPage = pathname === "/forgotPassword";

  // Filter navLinks to exclude Account on admin page and forgot password page
  const filteredNavLinks = isAdminPage || isForgotPasswordPage ? [] : navLinks;

  // Hide the 3 dots menu on forgot password page
  const showMenu = !isForgotPasswordPage;

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
    }
  };

  // Don't render header on auth pages or noInternet
  if (isAuthPage || isNoInternetPage) {
    return (
      <header className="sticky top-0 z-50 h-16 w-full items-stretch justify-stretch border-b border-gray-200 bg-orange-500 backdrop-blur-md dark:border-gray-800 dark:bg-orange-600">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo - No link on noInternet page */}
          <div className="flex items-center gap-2 text-xl font-bold text-gray-100">
            <span>Bob Money Check</span>
          </div>
        </div>
      </header>
    );
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

        {/* Navigation */}
        <nav className="flex items-center gap-1 ml-auto">
          {filteredNavLinks.map((link) => {
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
          {showMenu && (
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
          )}
        </nav>
      </div>
    </header>
  );
}
