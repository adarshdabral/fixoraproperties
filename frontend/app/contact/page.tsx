import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Fixora Properties by phone, WhatsApp, or email.",
};

export default function ContactPage() {
  return (
    <div className="container-content py-16">
      <div className="max-w-xl">
        <h1 className="font-display text-4xl text-ink">Contact Fixora</h1>
        <p className="mt-4 text-ink-500">
          Have a question about a specific property? The fastest way to reach us is the{" "}
          <strong>Request Information</strong> button on that property&apos;s page — our team
          reviews it and follows up.
        </p>
        <p className="mt-4 text-ink-500">For everything else, reach our team directly:</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {CONTACT_PHONE && (
            <>
              <ContactTile href={CONTACT_PHONE.tel} icon={<Phone className="h-5 w-5" />} label="Call us" value={CONTACT_PHONE.display} />
              <ContactTile
                href={CONTACT_PHONE.whatsapp}
                external
                icon={<MessageCircle className="h-5 w-5" />}
                label="WhatsApp"
                value={CONTACT_PHONE.display}
              />
            </>
          )}
          <ContactTile href={`mailto:${CONTACT_EMAIL}`} icon={<Mail className="h-5 w-5" />} label="Email" value={CONTACT_EMAIL} />
        </div>

        <Button asChild variant="gold" className="mt-8">
          <Link href="/properties">Browse properties</Link>
        </Button>
      </div>
    </div>
  );
}

function ContactTile({
  href,
  icon,
  label,
  value,
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-4 rounded-xl2 border border-line bg-white p-5 transition-colors hover:border-gold"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">{icon}</span>
      <span>
        <span className="block text-xs text-ink-300">{label}</span>
        <span className="block font-medium text-ink">{value}</span>
      </span>
    </a>
  );
}
