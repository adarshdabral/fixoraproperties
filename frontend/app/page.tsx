import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Castle,
  Home,
  LandPlot,
  Mail,
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
import { searchProperties } from "@/services/property.server";
import { PROPERTY_CATEGORIES } from "@/lib/shared/types";
import { categoryLabel } from "@/lib/utils";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Fixora Properties | Homes, plots and property in Dehradun" },
  description:
    "Buy or rent homes, plots, villas and commercial property in Dehradun. Every listing is checked by the Fixora team, and every enquiry is handled by us.",
};

/** Fixora operates in Dehradun only — every listing query on this page is scoped to it. */
const CITY = "Dehradun";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  residential: <Home className="h-5 w-5" />,
  commercial: <Store className="h-5 w-5" />,
  land: <Trees className="h-5 w-5" />,
  plots: <LandPlot className="h-5 w-5" />,
  apartments: <Building2 className="h-5 w-5" />,
  villas: <Castle className="h-5 w-5" />,
};

const LOCALITIES = [
  { name: "Rajpur Road", note: "Established homes towards the Mussoorie foothills" },
  { name: "Sahastradhara Road", note: "Newer apartments and villas near the IT Park" },
  { name: "Vasant Vihar", note: "Settled residential colony in west Dehradun" },
  { name: "Prem Nagar", note: "Plots and independent houses off Chakrata Road" },
  { name: "Clement Town", note: "Quieter, greener streets in south Dehradun" },
  { name: "Doiwala", note: "Land and farmhouses on the way to Jolly Grant" },
];

const ENQUIRY_STEPS = [
  { title: "Find a property", body: "Search Dehradun by locality, budget and type. Every listing has been checked by our team before it goes live." },
  { title: "Send an enquiry", body: "Tap Request information on the listing. It takes under a minute and your number isn't shared with the seller." },
  { title: "We call you back", body: "A Fixora team member reviews your enquiry, answers your questions and speaks to the seller for you." },
  { title: "Visit the property", body: "We arrange a site visit with the seller at a time that suits you, anywhere in Dehradun." },
];

const FAQS = [
  {
    q: "Do you only list property in Dehradun?",
    a: "Yes. Fixora focuses on Dehradun and its surrounding areas, from Rajpur Road and Sahastradhara Road to Prem Nagar and Doiwala, so our team knows every locality we list in.",
  },
  {
    q: "Why can't I contact the seller directly?",
    a: "Every conversation goes through the Fixora team. It keeps sellers' personal numbers private, stops spam enquiries, and means someone on our side is responsible for following up with you.",
  },
  {
    q: "How are listings checked?",
    a: "Every new or edited listing is reviewed by our team before it's published. Listings with missing or inconsistent details are sent back to the owner to fix.",
  },
  {
    q: "Can I visit a property before deciding?",
    a: "Yes. Send an enquiry on the listing and our team will arrange a site visit with the seller.",
  },
];

// Quoted so the text search matches the whole locality name, not any listing containing "road".
const localityHref = (name: string) => `/properties?city=${CITY}&q=${encodeURIComponent(`"${name}"`)}`;

export default async function HomePage() {
  const [featured, negotiable, latest] = await Promise.allSettled([
    searchProperties({ city: CITY, featured: "true", limit: "6" }),
    searchProperties({ city: CITY, negotiable: "true", limit: "3" }),
    searchProperties({ city: CITY, limit: "6" }),
  ]);

  const featuredProperties = featured.status === "fulfilled" ? featured.value.items : [];
  const negotiableProperties = negotiable.status === "fulfilled" ? negotiable.value.items : [];
  const latestProperties = latest.status === "fulfilled" ? latest.value.items : [];
  const liveCount = latest.status === "fulfilled" ? latest.value.total : 0;
  const showcase = featuredProperties.length > 0 ? featuredProperties : latestProperties;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="container-content grid gap-12 py-14 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16 lg:py-20">
          <div>
            <h1 className="max-w-xl font-display text-[2.6rem] leading-[1.05] tracking-tight text-ink text-balance sm:text-6xl">
              Property in Dehradun, checked before you see it.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-500">
              Homes, plots, villas and shops across the Doon valley, listed by owners and reviewed by
              our team. Every enquiry goes through us, so you always know who to call.
            </p>
            <div className="mt-9">
              <HeroSearch />
            </div>
            <p className="mt-4 text-sm text-ink-300">
              {liveCount > 0 ? (
                <>
                  <span className="font-medium text-ink">{liveCount.toLocaleString("en-IN")}</span> Dehradun{" "}
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

          <nav aria-label="Browse by locality" className="rounded-[1.75rem] border border-line bg-paper p-6 sm:p-8">
            <h2 className="font-display text-lg text-ink">Where in Dehradun?</h2>
            <ul className="mt-4 divide-y divide-line">
              {LOCALITIES.map((locality, i) => (
                <li key={locality.name} className="motion-safe:animate-hero-in" style={{ animationDelay: `${100 + i * 70}ms` }}>
                  <Link href={localityHref(locality.name)} className="group flex items-center justify-between gap-4 py-3.5">
                    <span>
                      <span className="block font-display text-xl text-ink group-hover:text-gold-600 sm:text-2xl">{locality.name}</span>
                      <span className="mt-0.5 block text-sm text-ink-300">{locality.note}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-line bg-paper">
        <div className="container-content flex gap-2 overflow-x-auto py-5 sm:justify-between">
          {PROPERTY_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/properties?city=${CITY}&category=${category}`}
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
            <h2 className="font-display text-3xl text-ink">
              {featuredProperties.length > 0 ? "Featured in Dehradun" : "Latest in Dehradun"}
            </h2>
            <Link
              href={featuredProperties.length > 0 ? `/properties?city=${CITY}&featured=true` : `/properties?city=${CITY}`}
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-ink hover:text-gold-600 sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {showcase.length === 0 ? (
              <EmptyState
                icon={<SearchIcon className="h-6 w-6" />}
                title="No Dehradun properties are live yet"
                description="New listings appear here once our team has reviewed them. Own property in Dehradun? List it and be among the first."
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
      <section className="border-y border-line bg-white py-16 lg:py-20">
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
              title="Buying or renting in Dehradun"
              points={[
                "Every listing reviewed before it's published",
                "Your number is only seen by the Fixora team",
                "Site visits arranged for you across the city",
              ]}
              cta={{ href: `/properties?city=${CITY}`, label: "Browse Dehradun properties" }}
            />
            <Audience
              title="Selling or leasing out in Dehradun"
              points={[
                "List your house, flat, plot or shop in a few minutes",
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
              <h2 className="font-display text-3xl text-ink">Open to offers in Dehradun</h2>
              <Link
                href={`/properties?city=${CITY}&negotiable=true`}
                className="hidden items-center gap-1 text-sm font-medium text-ink hover:text-gold-600 sm:flex"
              >
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
            <h2 className="font-display text-3xl text-ink">Talk to our Dehradun team</h2>
            <p className="mt-2 max-w-lg text-ink-500">
              Questions about a listing, a site visit, or selling your property in Dehradun? We&apos;re a call or a message away.
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
