/**
 * Fixora's public contact details. The phone number comes from the
 * environment so it can change without a code edit; when it's unset every
 * call/WhatsApp entry point simply doesn't render.
 *
 * This is Fixora's own number — buyers call Fixora, never a seller
 * directly (see docs/SECURITY.md).
 */
const rawPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || null;

export const CONTACT_EMAIL = "hello@fixora.dev";

export const CONTACT_PHONE = rawPhone
  ? {
      display: rawPhone,
      tel: `tel:${rawPhone.replace(/[^\d+]/g, "")}`,
      whatsapp: `https://wa.me/${rawPhone.replace(/\D/g, "")}`,
    }
  : null;
