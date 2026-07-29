import { AuroraBackground } from "@/components/brand/aurora-background";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";
import { serverApiFetch } from "@/lib/api-server";
import type { ProfileData } from "@/types/profile";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await serverApiFetch<ProfileData>("/admin/profile");

  return (
    <div className="relative min-h-screen">
      <AuroraBackground variant="subtle" />
      <AdminShell profile={profile}>{children}</AdminShell>
      <Toaster />
    </div>
  );
}
