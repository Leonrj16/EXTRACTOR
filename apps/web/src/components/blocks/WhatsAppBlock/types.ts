export interface WhatsAppBlockMeta {
  /** Digits only (country code + number), e.g. "5215512345678". */
  phone?: string;
  /** Pre-filled message opened in the chat. */
  message?: string;
}
