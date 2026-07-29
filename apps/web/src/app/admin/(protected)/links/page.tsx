import { LinksManager } from "@/components/admin/links-manager";
import { serverApiFetch } from "@/lib/api-server";
import type { LinkItem } from "@/types/link";

export default async function LinksPage() {
  const links = await serverApiFetch<LinkItem[]>("/admin/links");

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-1 pb-8">
      <h1 className="font-heading text-2xl font-semibold">Enlaces</h1>
      <LinksManager initialLinks={links} />
    </main>
  );
}
