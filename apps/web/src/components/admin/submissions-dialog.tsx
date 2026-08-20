"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminFetch } from "@/lib/api-client";
import type { LinkItem } from "@/types/link";

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export function SubmissionsDialog({
  link,
  onOpenChange,
}: {
  link: LinkItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!link) return;
    setLoading(true);
    adminFetch<Submission[]>(`/admin/links/${link.id}/submissions`)
      .then(setSubmissions)
      .finally(() => setLoading(false));
  }, [link]);

  return (
    <Dialog open={!!link} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mensajes — {link?.title}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Cargando…
          </p>
        ) : submissions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Todavía no hay mensajes.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-xl border border-border-subtle bg-surface-1 p-4 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{submission.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{submission.email}</p>
                <p className="mt-2.5 leading-relaxed">{submission.message}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
