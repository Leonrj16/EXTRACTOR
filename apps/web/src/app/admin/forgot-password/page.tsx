"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/brand/aurora-background";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Se muestra el mismo mensaje exista o no la cuenta — evita que este
      // formulario sirva para adivinar qué emails están registrados.
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="font-heading text-xl font-semibold">Recuperar contraseña</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Te enviamos un enlace para elegir una nueva.
            </p>
          </div>
        </div>

        <Card className="p-2">
          <CardContent>
            {sent ? (
              <div className="flex flex-col gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Si <strong>{email}</strong> tiene una cuenta, te llegará un correo con las
                  instrucciones. Revisa también spam.
                </p>
                <Link href="/admin/login" className="text-sm text-brand-purple-light hover:underline">
                  Volver a iniciar sesión
                </Link>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="mt-1 w-full" loading={loading}>
                  {loading ? "Enviando…" : "Enviar enlace"}
                </Button>
                <Link
                  href="/admin/login"
                  className="text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Volver a iniciar sesión
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
