import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Fixora Properties.",
};

export default function ContactPage() {
  return (
    <div className="container-content py-16">
      <div className="max-w-xl">
        <h1 className="font-display text-4xl text-ink">Contact Fixora</h1>
        <p className="mt-4 text-ink-500">
          Have a question about a specific property? The fastest way to reach us is the{" "}
          <strong>Request Information</strong> button on that property&apos;s page — it routes
          directly to the Fixora representative handling that listing.
        </p>
        <p className="mt-4 text-ink-500">For everything else, reach our team directly:</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href="mailto:hello@fixora.dev">
              <Mail className="mr-2 h-4 w-4" /> hello@fixora.dev
            </a>
          </Button>
          <Button asChild variant="gold">
            <Link href="/properties">Browse properties</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
