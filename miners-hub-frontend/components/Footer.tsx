"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { Twitter, Facebook, MessageCircle, Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info with Logo */}
          <div>
            <Link href={ROUTES.HOME} className="flex items-center space-x-2 mb-4">
              <Briefcase className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold text-text">Miners Hub</span>
            </Link>
            <p className="text-text/80 text-sm">
              The digital frontier for mineral trading, connecting Africa's resources with the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Miners */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">For Miners</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/list-minerals"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  List Minerals
                </Link>
              </li>
              <li>
                <Link
                  href="/verification"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/market-data"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  Market Data
                </Link>
              </li>
            </ul>
          </div>

          {/* For Investors */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">For Investors</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={ROUTES.MARKETPLACE}
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/secure-escrow"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  Secure Escrow
                </Link>
              </li>
              <li>
                <Link
                  href="/due-diligence"
                  className="text-text/80 hover:text-accent transition-colors min-h-[44px] flex items-center"
                >
                  Due Diligence
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal, Copyright & Social */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Legal Links */}
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-text/60 hover:text-accent transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-text/60 hover:text-accent transition-colors text-sm"
              >
                Terms & Conditions
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-text/60 text-sm">
              © {new Date().getFullYear()} Miners Hub. All rights reserved.
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text/80 hover:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text/80 hover:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="/contact"
                className="text-text/80 hover:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Contact"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

