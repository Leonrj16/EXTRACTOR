import { LinksManager } from "@/components/admin/links-manager";
import { serverApiFetch } from "@/lib/api-server";
import type { LinkItem } from "@/types/link";

export default async function LinksPage() {
  const links = await serverApiFetch<LinkItem[]>("/admin/links");

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Enlaces</h1>
      <LinksManager initialLinks={links} />
    </main>
  );
}
