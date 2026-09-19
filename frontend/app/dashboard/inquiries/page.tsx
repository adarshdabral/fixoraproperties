"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listMyInquiries } from "@/services/buyer.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export default function MyInquiriesPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["my-inquiries"], queryFn: listMyInquiries });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState description="Couldn't load your enquiries." />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">My enquiries</h1>
      <div className="mt-6">
        {data.inquiries.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="No enquiries yet"
            description="Enquiries you send from a property page will show up here."
            action={
              <Link href="/properties" className="text-sm font-medium text-ink hover:text-gold-600">
                Browse properties →
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {data.inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-xl2 border border-line bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink-300">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                    <p className="mt-1 text-ink">{inquiry.message}</p>
                  </div>
                  <Badge variant="neutral">{titleCase(inquiry.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
