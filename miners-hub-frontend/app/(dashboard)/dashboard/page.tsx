import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Welcome to your dashboard. This is a protected route.
      </p>
      <div className="space-y-2">
        <Link
          href={ROUTES.PROFILE}
          className="block text-blue-600 hover:underline dark:text-blue-400"
        >
          → Go to Profile
        </Link>
        <Link
          href={ROUTES.CONTRACTS}
          className="block text-blue-600 hover:underline dark:text-blue-400"
        >
          → Go to Contracts
        </Link>
      </div>
    </div>
  );
}

