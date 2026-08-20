import type { Metadata } from "next";
import {
  Inter,
  Space_Grotesk,
  Geist_Mono,
  Manrope,
  Poppins,
  Outfit,
  DM_Sans,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

// These 7 (plus Geist Mono for code) are the Theme Engine's font catalog
// — see themes/shared/fonts.ts. Loaded once here as CSS variables so any
// theme's typography.font resolves to a real web font instead of a bare
// name string the browser has no file for. Satoshi isn't on Google
// Fonts and isn't loaded (see design-system/architecture/theme-engine.md).
// Explicit weight arrays (not "variable") so font-weight actually
// switches between real files rather than the browser faking bold.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura — Tu presencia, en un solo lugar",
  description: "Una página de enlaces con identidad propia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${manrope.variable} ${poppins.variable} ${outfit.variable} ${dmSans.variable} ${plusJakartaSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
