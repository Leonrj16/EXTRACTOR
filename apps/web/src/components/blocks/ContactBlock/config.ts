import { Mail } from "lucide-react";
import type { ContactBlockMeta } from "./types";

export const CONTACT_BLOCK_DEFAULT_META: ContactBlockMeta = { mode: "form" };
export const CONTACT_BLOCK_ICON = Mail;
export const CONTACT_BLOCK_LABEL = "Contacto";
export const CONTACT_BLOCK_DESCRIPTION =
  "Un formulario de contacto, o un botón directo a WhatsApp, email o teléfono.";
