import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            Fixora <span className="text-gold">Properties</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink-300">
            Homes, plots and commercial property in Dehradun, listed by owners and checked by our
            team. Every enquiry is handled by Fixora.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            {CONTACT_PHONE && (
              <a href={CONTACT_PHONE.tel} className="flex items-center gap-2 font-medium text-ink hover:text-gold-600">
                <Phone className="h-4 w-4 text-gold-600" /> {CONTACT_PHONE.display}
              </a>
            )}
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 text-ink-500 hover:text-ink">
              <Mail className="h-4 w-4 text-gold-600" /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <FooterColumn
          title="Explore"
          links={[
            { href: "/properties", label: "All properties" },
            { href: "/properties?featured=true", label: "Featured" },
            { href: "/properties?negotiable=true", label: "Negotiable" },
            { href: "/sell", label: "List your property" },
          ]}
        />

        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About Fixora" },
            { href: "/contact", label: "Contact" },
          ]}
        />

        <FooterColumn
          title="Account"
          links={[
            { href: "/auth/login", label: "Log in" },
            { href: "/auth/register", label: "Create an account" },
          ]}
        />
      </div>

      <div className="border-t border-line py-6">
        <p className="container-content text-xs text-ink-300">
          © {new Date().getFullYear()} Fixora Properties. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-ink-300 hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
