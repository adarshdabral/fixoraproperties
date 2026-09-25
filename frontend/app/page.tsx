import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  Castle,
  Home,
  LandPlot,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search as SearchIcon,
  Store,
  Trees,
} from "lucide-react";
import { HeroSearch } from "@/features/home/hero-search";
import { PropertyCard } from "@/components/property/property-card";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { getFeaturedProperties, getPublicSettings, searchProperties } from "@/services/property.server";
import { PROPERTY_CATEGORIES, type PublicPropertyDTO } from "@/lib/shared/types";
import { categoryLabel, formatPriceINR } from "@/lib/utils";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/site";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  residential: <Home className="h-5 w-5" />,
  commercial: <Store className="h-5 w-5" />,
  land: <Trees className="h-5 w-5" />,
  plots: <LandPlot className="h-5 w-5" />,
  apartments: <Building2 className="h-5 w-5" />,
  villas: <Castle className="h-5 w-5" />,
};

const ENQUIRY_STEPS = [
  { title: "Find a property", body: "Search by city, budget and category. Every listing has been checked by our team before it goes live." },
  { title: "Send an enquiry", body: "Tap Request information on the listing. It takes under a minute and doesn't share your number with the seller." },
  { title: "We call you back", body: "A Fixora team member reviews your enquiry, answers questions and arranges visits with the seller." },
  { title: "Close at the listed price", body: "The price you saw already includes our fee, so the number doesn't change at the end." },
];

const FAQS = [
  {
    q: "Why can't I contact the seller directly?",
    a: "Every conversation goes through the Fixora team. It keeps sellers' personal numbers private, stops duplicate or spam enquiries, and means someone on our side is accountable for following up with you.",
  },
  {
    q: "Is the listed price the final price?",
    a: "The listed price already includes Fixora's platform fee on top of the seller's ask. There's no separate brokerage added later. Listings marked Negotiable are open to offers.",
  },
  {
    q: "How are listings checked?",
    a: "Every new or edited listing is reviewed by our team before it's published. Listings with missing or inconsistent details are sent back to the seller to fix.",
  },
  {
    q: "What does it cost to list a property?",
    a: "Nothing up front. Sellers set their ask price and receive that full amount; the platform fee is added on top for buyers.",
  },
];

export default async function HomePage() {
  const [featured, negotiable, latest, settings] = await Promise.allSettled([
    getFeaturedProperties(6),
    searchProperties({ negotiable: "true", limit: "3" }),
    searchProperties({ limit: "6" }),
    getPublicSettings(),
  ]);

  const featuredProperties = featured.status === "fulfilled" ? featured.value.items : [];
  const negotiableProperties = negotiable.status === "fulfilled" ? negotiable.value.items : [];
  const latestProperties = latest.status === "fulfilled" ? latest.value.items : [];
  const liveCount = latest.status === "fulfilled" ? latest.value.total : 0;
  const feePercent = settings.status === "fulfilled" ? settings.value.platformFeePercent : null;

  // The hero receipt prices a real listing — preferring one with a photo, featured first.
  const candidates = [...featuredProperties, ...latestProperties];
  const heroProperty = candidates.find((p) => p.media.length > 0) ?? candidates[0] ?? null;
  const showcase = featuredProperties.length > 0 ? featuredProperties : latestProperties;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="container-content grid gap-12 py-14 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16 lg:py-20">
          <div>
            <h1 className="max-w-xl font-display text-[2.6rem] leading-[1.05] tracking-tight text-ink text-balance sm:text-6xl">
              Property listed by owners, checked by us.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-500">
              Homes, plots and commercial spaces across India. Our team reviews every listing and
              handles every enquiry. Every price shows exactly what goes to the seller and what goes to us.
            </p>
            <div className="mt-9">
              <HeroSearch />
            </div>
            <p className="mt-4 text-sm text-ink-300">
              {liveCount > 0 ? (
                <>
                  <span className="font-medium text-ink">{liveCount.toLocaleString("en-IN")}</span> reviewed{" "}
                  {liveCount === 1 ? "listing" : "listings"} live now.{" "}
                </>
              ) : null}
              {CONTACT_PHONE ? (
                <>
                  Rather talk?{" "}
                  <a href={CONTACT_PHONE.tel} className="font-medium text-ink underline decoration-gold underline-offset-4 hover:text-gold-600">
                    Call {CONTACT_PHONE.display}
                  </a>
                </>
              ) : null}
            </p>
          </div>

          <PriceReceipt property={heroProperty} feePercent={feePercent} />
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-line bg-paper">
        <div className="container-content flex gap-2 overflow-x-auto py-5 sm:justify-between">
          {PROPERTY_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/properties?category=${category}`}
              className="flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-white hover:text-ink focus-visible:bg-white"
            >
              <span className="text-gold-600">{CATEGORY_ICONS[category]}</span>
              {categoryLabel(category)}
            </Link>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="py-16 lg:py-20">
        <div className="container-content">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-ink">
                {featuredProperties.length > 0 ? "Featured properties" : "Latest properties"}
              </h2>
              <p className="mt-2 text-ink-300">Prices shown include the Fixora platform fee.</p>
            </div>
            <Link
              href={featuredProperties.length > 0 ? "/properties?featured=true" : "/properties"}
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-ink hover:text-gold-600 sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {showcase.length === 0 ? (
              <EmptyState
                icon={<SearchIcon className="h-6 w-6" />}
                title="No properties are live yet"
                description="New listings appear here once our team has reviewed them. Own a property? List it and be among the first."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/sell">List your property</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {showcase.map((property, i) => (
                  <PropertyCard key={property.id} property={property} priority={i < 3} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>


      {/* How an enquiry works */}
      <section className="border-b border-line bg-white py-16 lg:py-20">
        <div className="container-content">
          <h2 className="max-w-lg font-display text-3xl text-ink">How buying through Fixora works</h2>
          <ol className="relative mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <span aria-hidden className="absolute left-5 right-5 top-5 hidden h-px bg-line lg:block" />
            {ENQUIRY_STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-white font-display text-lg text-gold-600">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-medium text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Buyers / sellers */}
      <section className="py-16 lg:py-20">
        <div className="container-content">
          <div className="grid gap-px overflow-hidden rounded-xl2 border border-line bg-line md:grid-cols-2">
          <Audience
            title="Buying or renting"
            points={[
              "Every listing reviewed before it's published",
              "Your number is only seen by the Fixora team",
              "Our team follows up on every enquiry you send",
            ]}
            cta={{ href: "/properties", label: "Browse properties" }}
          />
          <Audience
            title="Selling or leasing out"
            points={[
              "Free to list — you receive your full ask price",
              "Buyers never get your personal phone number",
              "Our team reviews enquiries before passing them on",
            ]}
            cta={{ href: "/auth/register?role=SELLER", label: "List your property" }}
            gold
          />
          </div>
        </div>
      </section>

      {/* Negotiable properties */}
      {negotiableProperties.length > 0 && (
        <section className="border-t border-line bg-white py-16 lg:py-20">
          <div className="container-content">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl text-ink">Open to offers</h2>
              <Link href="/properties?negotiable=true" className="hidden items-center gap-1 text-sm font-medium text-ink hover:text-gold-600 sm:flex">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {negotiableProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t border-line py-16 lg:py-20">
        <div className="container-content grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <h2 className="font-display text-3xl text-ink">Questions people ask us</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span aria-hidden className="text-xl leading-none text-gold-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-prose leading-relaxed text-ink-500">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-line bg-white py-16">
        <div className="container-content grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-3xl text-ink">Talk to the Fixora team</h2>
            <p className="mt-2 max-w-lg text-ink-500">
              Questions about a listing, a visit, or selling your property? We&apos;re a call or a message away.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {CONTACT_PHONE && (
              <>
                <Button asChild variant="primary" size="lg">
                  <a href={CONTACT_PHONE.tel}>
                    <Phone className="h-4 w-4" /> {CONTACT_PHONE.display}
                  </a>
                </Button>
                <Button asChild size="lg" className="bg-sage text-white hover:bg-sage/90">
                  <a href={CONTACT_PHONE.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </>
            )}
            <Button asChild variant="outline" size="lg">
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="h-4 w-4" /> Email us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function PriceReceipt({ property, feePercent }: { property: PublicPropertyDTO | null; feePercent: number | null }) {
  const listed = property?.price.amount ?? null;
  // Listed prices are the ask marked up by the fee (rounded to the rupee), so invert that to show the split.
  const ask = listed !== null && feePercent !== null ? Math.round(listed / (1 + feePercent / 100)) : null;
  const fee = listed !== null && ask !== null ? listed - ask : null;
  const cover = property?.media[0];
  const feeLabel = feePercent !== null ? `Fixora fee (${feePercent}%)` : "Fixora fee";

  // Without the fee percentage the split can't be shown honestly, so the receipt shows just the total.
  const rows: { label: string; value: string }[] =
    feePercent === null
      ? []
      : [
          { label: "Seller's ask", value: ask !== null ? formatPriceINR(ask) : "Set by the owner" },
          { label: feeLabel, value: fee !== null ? formatPriceINR(fee) : `${feePercent}% of the ask` },
        ];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-line bg-paper shadow-card">
      {property && cover && (
        <Link href={`/properties/${property.slug}`} className="group relative block aspect-[16/10] overflow-hidden bg-ink/5">
          <Image
            src={cover.url}
            alt={cover.alt || property.title}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </Link>
      )}

      <div className="p-6 sm:p-8">
        {property ? (
          <Link href={`/properties/${property.slug}`} className="group block">
            <p className="line-clamp-1 font-display text-lg text-ink group-hover:text-gold-600">{property.title}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-300">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">
                {property.location.city}, {property.location.state}
              </span>
            </p>
          </Link>
        ) : (
          <p className="font-display text-lg text-ink">How every price on Fixora is made</p>
        )}

        {rows.length > 0 && (
        <dl className="mt-6 space-y-3">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 motion-safe:animate-hero-in"
              style={{ animationDelay: `${150 + i * 180}ms` }}
            >
              <dt className="text-sm text-ink-500">{row.label}</dt>
              <dd className="font-medium tabular-nums text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
        )}

        <div
          className="mt-5 flex items-end justify-between gap-4 border-t border-dashed border-ink/25 pt-5 motion-safe:animate-hero-in"
          style={{ animationDelay: "560ms" }}
        >
          <p className="pb-1.5 text-sm font-medium text-ink">You pay</p>
          <p className="font-display text-5xl leading-none tracking-tight tabular-nums text-ink sm:text-6xl">
            {listed !== null ? formatPriceINR(listed) : "Ask + fee"}
          </p>
        </div>
        <p className="mt-4 text-xs text-ink-300">
          {rows.length > 0
            ? "Nothing else is added at closing. The seller receives their full ask."
            : "Includes Fixora's platform fee. Nothing else is added at closing."}
        </p>
      </div>
    </div>
  );
}

function Audience({
  title,
  points,
  cta,
  gold = false,
}: {
  title: string;
  points: string[];
  cta: { href: string; label: string };
  gold?: boolean;
}) {
  return (
    <div className="flex flex-col bg-white p-8 sm:p-10">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <ul className="mt-6 flex-1 space-y-4">
        {points.map((point) => (
          <li key={point} className="flex gap-3 text-ink-500">
            <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {point}
          </li>
        ))}
      </ul>
      <Button asChild variant={gold ? "gold" : "primary"} className="mt-8 self-start">
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </div>
  );
}
