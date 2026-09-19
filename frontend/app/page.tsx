import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, Handshake, Search as SearchIcon } from "lucide-react";
import { HeroSearch } from "@/features/home/hero-search";
import { PropertyCard } from "@/components/property/property-card";
import { EmptyState } from "@/components/ui/states";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getFeaturedProperties, searchProperties } from "@/services/property.server";
import { PROPERTY_CATEGORIES } from "@/lib/shared/types";
import { categoryLabel } from "@/lib/utils";

export default async function HomePage() {
  const [featured, negotiable] = await Promise.allSettled([
    getFeaturedProperties(6),
    searchProperties({ negotiable: "true", limit: "3" }),
  ]);

  const featuredProperties = featured.status === "fulfilled" ? featured.value.items : [];
  const negotiableProperties = negotiable.status === "fulfilled" ? negotiable.value.items : [];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-white to-paper">
        <div className="container-content grid gap-10 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="inline-flex items-center rounded-full bg-gold-100 px-3 py-1 text-xs font-medium text-gold-600">
              Direct. Verified. Transparent pricing.
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
              Find the right property.
              <br />
              <span className="italic text-gold-600">We handle the rest.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-500">
              Fixora Properties connects buyers with verified listings from sellers and builders.
              Every enquiry is reviewed by our team, and the price you see already includes our
              platform fee — no surprises at closing.
            </p>
            <div className="mt-8">
              <HeroSearch />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Properties reviewed by our team" value="100%" />
              <StatCard label="Direct seller contact shared" value="0" />
              <StatCard label="Platform fee, always shown" value="Upfront" />
              <StatCard label="Categories covered" value={String(PROPERTY_CATEGORIES.length)} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-content py-16">
        <Reveal>
          <h2 className="font-display text-2xl text-ink">Browse by category</h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PROPERTY_CATEGORIES.map((category, i) => (
            <Reveal key={category} delay={i * 0.04}>
              <Link
                href={`/properties?category=${category}`}
                className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl2 border border-line bg-white text-center text-sm font-medium text-ink-500 transition-colors hover:border-gold hover:text-ink"
              >
                {categoryLabel(category)}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="border-t border-line bg-white py-16">
        <div className="container-content">
          <div className="flex items-end justify-between">
            <Reveal>
              <h2 className="font-display text-2xl text-ink">Featured properties</h2>
            </Reveal>
            <Link href="/properties?featured=true" className="hidden items-center gap-1 text-sm font-medium text-ink hover:text-gold-600 sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6">
            {featuredProperties.length === 0 ? (
              <EmptyState
                icon={<SearchIcon className="h-6 w-6" />}
                title="No featured properties yet"
                description="Check back soon, or browse the full listing catalog."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/properties">Browse all properties</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProperties.map((property, i) => (
                  <PropertyCard key={property.id} property={property} priority={i < 3} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Fixora */}
      <section className="container-content py-16">
        <Reveal>
          <h2 className="font-display text-2xl text-ink">Why buyers and sellers choose Fixora</h2>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Confidential by design"
            description="Sellers' phone numbers and private details are never shared with buyers. Every conversation goes through Fixora."
          />
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="Reviewed by our team"
            description="Every enquiry is reviewed by the Fixora team before it's passed along, so nothing gets lost."
          />
          <FeatureCard
            icon={<Handshake className="h-5 w-5" />}
            title="Transparent pricing"
            description="One platform fee, already included in the price you see. Sellers always receive their full ask price."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-white py-16">
        <div className="container-content">
          <Reveal>
            <h2 className="font-display text-2xl text-ink">How it works</h2>
          </Reveal>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: "Search", body: "Filter properties by city, budget, category, and more." },
              { step: "2", title: "Enquire", body: "Request information on any listing in a couple of clicks." },
              { step: "3", title: "Get connected", body: "Our team reviews your enquiry and reaches out to guide you — never the seller directly." },
              { step: "4", title: "Close the deal", body: "The price you saw already includes our platform fee — no surprises at closing." },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.05}>
                <div>
                  <span className="font-display text-3xl text-gold-600">{item.step}</span>
                  <h3 className="mt-2 font-medium text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-ink-300">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Negotiable properties */}
      {negotiableProperties.length > 0 && (
        <section className="container-content py-16">
          <div className="flex items-end justify-between">
            <Reveal>
              <h2 className="font-display text-2xl text-ink">Open to negotiation</h2>
            </Reveal>
            <Link href="/properties?negotiable=true" className="hidden items-center gap-1 text-sm font-medium text-ink hover:text-gold-600 sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {negotiableProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* Sell CTA */}
      <section className="border-t border-line bg-ink py-16 text-paper">
        <div className="container-content flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl">Have a property to sell or lease?</h2>
            <p className="mt-2 max-w-lg text-sm text-paper/70">
              List it with Fixora. Our team reviews every submission before it goes live, and
              manages enquiries on your behalf.
            </p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link href="/auth/register?role=SELLER">List your property</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-300">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Reveal>
      <div className="rounded-xl2 border border-line bg-white p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage">{icon}</div>
        <h3 className="mt-4 font-medium text-ink">{title}</h3>
        <p className="mt-1.5 text-sm text-ink-300">{description}</p>
      </div>
    </Reveal>
  );
}
