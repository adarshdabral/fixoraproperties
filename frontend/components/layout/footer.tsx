import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            Fixora <span className="text-gold">Properties</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink-300">
            A direct property marketplace for buyers and sellers. Every enquiry is reviewed by
            our team, and buyers see a transparent platform fee on top of the seller&apos;s price.
          </p>
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
