"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { createInquiry } from "@/services/buyer.service";
import { ApiError } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

/**
 * The only enquiry CTA on a property page. It never surfaces a seller
 * phone number — submitting creates an Inquiry (and behind it, a Lead
 * the admin team reviews) via POST /inquiries. See docs/SECURITY.md.
 */
export function EnquiryDialog({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(`I'm interested in "${propertyTitle}". Please share more details.`);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (user.role !== "BUYER") {
      e.preventDefault();
      toast({ variant: "error", title: "Only buyer accounts can send enquiries" });
    }
  };

  const handleSubmit = async () => {
    if (message.trim().length < 5) return;
    setSubmitting(true);
    try {
      await createInquiry(propertyId, message.trim());
      setSent(true);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Something went wrong";
      toast({ variant: "error", title: "Couldn't send enquiry", description: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="lg" className="w-full" onClick={handleTriggerClick}>
          Request Information
        </Button>
      </DialogTrigger>
      <DialogContent>
        {sent ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="mt-4">Your enquiry has been received by Fixora</DialogTitle>
            <DialogDescription>
              Our team will review your enquiry and reach out with next steps. You can track it from
              your dashboard.
            </DialogDescription>
            <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogTitle>Request information</DialogTitle>
            <DialogDescription>
              This goes to the Fixora team — not the seller directly.
            </DialogDescription>
            <div className="mt-4">
              <Label htmlFor="enquiry-message">Your message</Label>
              <Textarea
                id="enquiry-message"
                className="mt-1.5"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button className="mt-4 w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Sending…" : "Send enquiry"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
