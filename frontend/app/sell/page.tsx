import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sell or list your property",
  description: "List your property with Fixora Properties. You set the ask price, we handle enquiries, and you always receive what you asked for.",
};

const STEPS = [
  "Create a seller account and add your property, at your own ask price",
  "Our team reviews your listing before it goes live",
  "Buyers enquire through Fixora — your contact details stay private",
  "Our team reviews and forwards enquiries so you can follow up",
];

export default function SellPage() {
  return (
    <div className="container-content py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl text-ink">List your property with Fixora</h1>
        <p className="mt-4 text-ink-500">
          You set the ask price — that&apos;s exactly what you receive. Fixora adds a transparent
          platform fee on top for buyers, and handles enquiries on your behalf; your phone number
          is never shared with buyers directly.
        </p>

        <ul className="mt-8 space-y-3">
          {STEPS.map((step) => (
            <li key={step} className="flex items-start gap-3 text-ink-500">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
              {step}
            </li>
          ))}
        </ul>

        <Button asChild size="lg" variant="gold" className="mt-8">
          <Link href="/auth/register?role=SELLER">Get started as a seller</Link>
        </Button>
      </div>
    </div>
  );
}
