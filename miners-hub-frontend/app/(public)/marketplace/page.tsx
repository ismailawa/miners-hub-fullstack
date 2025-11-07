import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";

export default function MarketplacePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Browse available mineral listings.
      </p>
      <Link
        href={ROUTES.HOME}
        className="text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

