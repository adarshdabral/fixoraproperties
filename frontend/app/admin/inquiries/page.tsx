import type { Metadata } from "next";
import { InquiriesList } from "@/components/admin/inquiries-list";

export const metadata: Metadata = { title: "Enquiries" };

export default function AdminInquiriesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Enquiries</h1>
      <p className="mt-1 text-sm text-ink-300">
        Every enquiry a buyer sends from a property page, with who sent it and what they asked.
      </p>
      <div className="mt-6">
        <InquiriesList />
      </div>
    </div>
  );
}
