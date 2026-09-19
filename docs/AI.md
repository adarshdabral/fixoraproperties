# Fixora Properties — AI Assistant

**Status: not yet implemented** (Phase 3 per the client's roadmap — after
core listings/search and WhatsApp lead routing are live). This document
records the intended design so it isn't invented ad hoc later.

## Non-negotiable rule

The AI must never invent properties, prices, availability, amenities,
seller information, discounts, or legal claims. Every property fact it
states must come from a real database record it fetched via a tool call —
including price, which must reflect the current platform fee markup, never
a guessed figure. If data isn't available, it says so.

## Architecture

```
Web AI chat UI → POST /api/v1/ai/chat → AI service → intent extraction
  → tool calling → Property/Lead/Inquiry services (same services the REST
  API uses) → MongoDB → real results → AI response
```

The AI service calls the same service-layer functions the REST controllers
call — it never queries MongoDB directly and never bypasses the DTO layer,
so seller contact protection applies identically whether a buyer found a
property via search or via the assistant.

## Planned tools

- `searchProperties` — wraps the `/search` service with structured filters
  extracted from natural language (city, bedrooms, max price, category…).
- `getPropertyDetails`, `compareProperties`, `getFeaturedProperties`,
  `getNegotiableProperties`
- `captureLead` — incrementally collects name/phone/budget/requirements
  without a form
- `createInquiry` — creates a real `Inquiry`/`Lead` record
- `handoffToAdmin` — hands the structured requirement + selected property
  to the WhatsApp module for the admin team (see WHATSAPP.md)

## Conversation storage

`ai_conversations` / `ai_messages` collections will store role, message,
tool calls made, properties surfaced, and whether a lead was created —
so a buyer can resume a prior conversation and so admins can audit AI
lead-qualification quality.

## Configuration

`OPENAI_API_KEY` / `OPENAI_MODEL` (see `.env.example`). When unset,
`integrations.ai` (`backend/src/config/env.ts`) is `false` and the AI
routes should respond with a clear "AI assistant is not configured"
error rather than crashing — the rest of the platform (search, listings,
enquiries) must keep working without it.
