import type { Metadata } from "next";
import { ShieldCheck, Users, Handshake } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Fixora Properties connects property buyers and sellers directly, with every enquiry reviewed by our team and a transparent platform fee.",
};

export default function AboutPage() {
  return (
    <div className="container-content py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl text-ink">About Fixora Properties</h1>
        <p className="mt-4 text-ink-500">
          Fixora Properties is a direct property marketplace for buyers and sellers. Sellers list
          at their own ask price, buyers browse and enquire, and every enquiry is reviewed by our
          team before it's passed along — never bypassed automatically.
        </p>
        <p className="mt-4 text-ink-500">
          Instead of commission negotiated deal-by-deal, Fixora charges a single transparent
          platform fee, shown to buyers as part of the listed price. Sellers always receive their
          full ask price.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <Value icon={<ShieldCheck className="h-5 w-5" />} title="Confidentiality" body="Seller contact details are never shared with buyers directly." />
        <Value icon={<Users className="h-5 w-5" />} title="A dedicated team" body="Every enquiry is reviewed by the Fixora team before it moves forward." />
        <Value icon={<Handshake className="h-5 w-5" />} title="Transparent pricing" body="One platform fee, shown up front — no hidden commission." />
      </div>
    </div>
  );
}

function Value({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl2 border border-line bg-white p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage">{icon}</div>
      <h3 className="mt-4 font-medium text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-300">{body}</p>
    </div>
  );
}
