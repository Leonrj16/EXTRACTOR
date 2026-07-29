import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Bio Personal Platform
      </h1>
      <p className="max-w-md text-muted-foreground">
        Una página de enlaces, un solo lugar. Panel administrativo privado
        para gestionar tu perfil público.
      </p>
      <Link href="/admin/login" className={buttonVariants({ size: "lg" })}>
        Entrar al panel
      </Link>
    </main>
  );
}
