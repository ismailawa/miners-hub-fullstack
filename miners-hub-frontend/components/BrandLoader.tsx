"use client";

import React from "react";

interface BrandLoaderProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function BrandLoader({
  label = "Loading Miners Hub",
  fullScreen = false,
  className = "",
}: BrandLoaderProps) {
  return (
    <div
      className={[
        "flex items-center justify-center bg-primary text-text-secondary",
        fullScreen
          ? "min-h-screen"
          : "min-h-[220px] rounded-lg border border-border bg-secondary/70 p-8",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="brand-loader-blink relative flex h-24 w-24 items-center justify-center rounded-full border border-border bg-secondary shadow-sm">
          <img src="/favicon.svg" alt="" className="h-16 w-16 object-contain" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Miners Hub
          </p>
          <p className="text-sm text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
