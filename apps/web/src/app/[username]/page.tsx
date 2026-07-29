interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="h-24 w-24 rounded-full bg-muted" />
      <h1 className="text-xl font-semibold">@{username}</h1>
      <p className="text-muted-foreground">
        Página pública — se conecta a la API en la Fase 4.
      </p>
    </main>
  );
}
