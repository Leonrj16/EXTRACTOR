"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Generates the QR entirely client-side (the `qrcode` package encodes to a
 * data: URL PNG) — no backend endpoint needed, since it's a pure function
 * of the public URL the browser already knows.
 */
export function QrCodeButton({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const url = `${window.location.origin}${path}`;
    QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [open, path]);

  function handleDownload() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "aura-qr.png";
    link.click();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <QrCode className="size-3.5" />
        Código QR
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Código QR de tu página</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Código QR de tu página" className="size-56 rounded-xl border border-border" />
          ) : (
            <div className="flex size-56 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
              Generando…
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Cualquiera que escanee este código llega directo a tu página pública.
          </p>
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cerrar</DialogClose>
          <Button onClick={handleDownload} disabled={!dataUrl}>
            <Download className="size-3.5" />
            Descargar PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
