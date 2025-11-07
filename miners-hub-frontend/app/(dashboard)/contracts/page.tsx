import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";

export default function ContractsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Contracts</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        View and manage your contracts. This is a protected route.
      </p>
      <Link
        href={ROUTES.DASHBOARD}
        className="text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}

