# Fixora Properties — WhatsApp Integration

**Status: not yet implemented** (Phase 2 per the client's roadmap). This
document records the intended design.

## Purpose

Buyers never get a seller's phone number. Once a lead is qualified (via
manual enquiry or the AI assistant), the platform hands a **structured**
summary to the Fixora admin team over WhatsApp, using the Meta WhatsApp
Cloud API. The admin team, not the platform, then follows up with the
seller.

## Configuration

```
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_VERIFY_TOKEN
```

`integrations.whatsapp` (`apps/api/src/config/env.ts`) is `true` only when
all of these are present. When false, the "Continue on WhatsApp" action
should be hidden or return a clear "not configured" response — never a
silent no-op or a fabricated confirmation.

## Planned flow

```
Enquiry / AI conversation
   → Lead created or updated (status, source)
   → WhatsAppService sends a structured message to the admin team's
     WhatsApp number containing:
       Buyer Name, Requirement, Location, Budget, Property Type,
       Bedrooms, Selected Property, Lead ID
```

`WhatsAppService` is a thin, swappable wrapper around the Cloud API so the
rest of the codebase depends on an interface, not Meta's HTTP shape
directly — this is also where a future inbound-webhook handler
(`/api/v1/whatsapp/webhook`, verified against `WHATSAPP_VERIFY_TOKEN`)
will live if two-way sync becomes a requirement.
