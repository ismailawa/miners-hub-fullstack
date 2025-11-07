import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Create Account</h1>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
        Join Miners Hub to start trading minerals.
      </p>
      {/* Registration form will be implemented in Epic 2 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 sm:py-2.5 border rounded-md min-h-[44px] text-base sm:text-sm"
            placeholder="Enter your email"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 sm:py-2.5 border rounded-md min-h-[44px] text-base sm:text-sm"
            placeholder="Create a password"
            disabled
          />
        </div>
        <Button className="w-full min-h-[44px]" disabled>
          Create Account
        </Button>
      </div>
      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Sign in
        </Link>
      </p>
      <div className="mt-4 text-center">
        <Link
          href={ROUTES.HOME}
          className="text-sm text-gray-600 hover:underline dark:text-gray-400"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

