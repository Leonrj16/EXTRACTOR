import { Timer } from "lucide-react";
import type { CountdownBlockMeta } from "./types";

export const COUNTDOWN_BLOCK_DEFAULT_META: CountdownBlockMeta = { expiredText: "¡Ya comenzó!" };
export const COUNTDOWN_BLOCK_ICON = Timer;
export const COUNTDOWN_BLOCK_LABEL = "Cuenta regresiva";
export const COUNTDOWN_BLOCK_DESCRIPTION = "Una cuenta regresiva en vivo hacia una fecha objetivo.";
