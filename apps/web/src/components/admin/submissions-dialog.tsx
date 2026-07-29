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
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mensajes — {link?.title}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay mensajes.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{submission.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{submission.email}</p>
                <p className="mt-2">{submission.message}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
