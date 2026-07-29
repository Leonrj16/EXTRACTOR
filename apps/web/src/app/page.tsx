import Link from "next/link";
import { AuroraBackground } from "@/components/brand/aurora-background";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <AuroraBackground />
      <Logo className="scale-125" />
      <div className="flex flex-col items-center gap-4">
        <h1 className="max-w-2xl font-heading text-5xl font-semibold tracking-tight sm:text-6xl">
          Tu presencia,
          <br />
          <span className="text-gradient-aura">en un solo lugar.</span>
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Una página que se siente tan tuya como tu marca. Enlaces, productos,
          video y contacto — todo en una experiencia con identidad propia.
        </p>
      </div>
      <Link href="/admin/login" className={buttonVariants({ size: "lg" })}>
        Entrar al panel
      </Link>
    </main>
  );
}
