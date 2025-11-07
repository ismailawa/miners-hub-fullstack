"use client";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 sm:gap-8 py-16 px-4 sm:py-24 sm:px-8 md:py-32 md:px-16 bg-secondary">
        <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
          <h1 className="max-w-xs text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight sm:leading-10 tracking-tight text-text">
            Miners Hub
          </h1>
          <p className="max-w-md text-base sm:text-lg md:text-xl leading-6 sm:leading-8 text-text/80 px-4 sm:px-0">
            Trusted digital platform powering transparent trade, verified data,
            and smarter decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link href={ROUTES.MARKETPLACE} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto min-h-[44px]">Browse Marketplace</Button>
            </Link>
            <Link href={ROUTES.LOGIN} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">Sign In</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
