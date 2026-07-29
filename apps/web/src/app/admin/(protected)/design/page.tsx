import { DesignEditor } from "@/components/admin/design-editor";
import { serverApiFetch } from "@/lib/api-server";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData, ThemeData } from "@/types/profile";

export default async function DesignPage() {
  const [profile, appearance, themes, links] = await Promise.all([
    serverApiFetch<ProfileData>("/admin/profile"),
    serverApiFetch<AppearanceData>("/admin/appearance"),
    serverApiFetch<ThemeData[]>("/admin/themes"),
    serverApiFetch<LinkItem[]>("/admin/links"),
  ]);

  return (
    <main className="px-8 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Editor visual</h1>
      <DesignEditor
        initialProfile={profile}
        initialAppearance={appearance}
        themes={themes}
        links={links}
      />
    </main>
  );
}
