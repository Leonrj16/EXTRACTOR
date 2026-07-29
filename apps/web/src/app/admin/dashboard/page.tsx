import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Visitas (7d)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Clics (7d)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Enlaces activos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">—</CardContent>
        </Card>
      </div>
    </main>
  );
}
