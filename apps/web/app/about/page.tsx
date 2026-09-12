import type { Metadata } from "next";
import { ShieldCheck, Users, Handshake } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Fixora Properties is a brokerage-led platform connecting buyers with verified sellers and builders.",
};

export default function AboutPage() {
  return (
    <div className="container-content py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl text-ink">About Fixora Properties</h1>
        <p className="mt-4 text-ink-500">
          Fixora Properties is a commission-based real-estate brokerage platform. We connect
          property sellers and builders with buyers, while keeping every conversation, negotiation,
          and transaction managed by our own team of representatives — never a direct exchange
          between buyer and seller.
        </p>
        <p className="mt-4 text-ink-500">
          That controlled-communication model exists for a reason: it protects seller privacy,
          prevents deals from bypassing the brokerage, and lets our representatives actively manage
          negotiation and coordination from the first enquiry through to closing.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <Value icon={<ShieldCheck className="h-5 w-5" />} title="Confidentiality" body="Seller contact details are never shared with buyers directly." />
        <Value icon={<Users className="h-5 w-5" />} title="A dedicated team" body="Every enquiry is assigned to a named Fixora representative." />
        <Value icon={<Handshake className="h-5 w-5" />} title="Full-service brokerage" body="From search to signing, we coordinate every step of the deal." />
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
