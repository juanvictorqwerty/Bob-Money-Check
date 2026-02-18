
export const inputStyle="outline-none border-2 rounded-md px-2 py-1 w-full focus:border-orange-300"

export const navLinkStyle = (isActive: boolean) =>
  `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-orange-600 font-bold text-gray-50 dark:bg-orange-700 dark:text-gray-100"
      : "text-gray-50 font-bold hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-50 dark:hover:text-gray-100"
  }`;