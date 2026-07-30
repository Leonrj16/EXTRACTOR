export type ContactMode = "form" | "whatsapp" | "email" | "phone";

export interface ContactBlockMeta {
  mode?: ContactMode;
  /** Phone number / email address used by the whatsapp/email/phone modes. */
  contact?: string;
}
