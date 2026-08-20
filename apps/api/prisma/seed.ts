import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// El catálogo de temas del sistema. La definición de renderizado completa
// (colores, tipografía, botones, cards, animaciones, efectos) vive en
// código en apps/web/src/themes/<key>/ — esa es la fuente de verdad para
// cómo se ve cada tema. Aquí solo se siembra el metadata liviano que la
// API necesita servir de forma independiente del frontend: nombre,
// layout, categorías (para filtrar) y tagline (para la galería), más el
// matching determinístico del endpoint "Generar con IA" — ver
// design-system/architecture/theme-engine.md sobre esta decisión.
const THEMES = [
  { key: 'minimal-white', name: 'Minimal White', layout: 'list', categories: ['minimalist'], tagline: 'Blanco, limpio y directo.' },
  { key: 'midnight-dark', name: 'Midnight Dark', layout: 'list', categories: ['dark'], tagline: 'Oscuridad elegante para las noches de trabajo.' },
  { key: 'aurora', name: 'Aurora', layout: 'list', categories: ['creative', 'dark'], tagline: 'Luces que respiran detrás de tu contenido.' },
  { key: 'glass-premium', name: 'Glass Premium', layout: 'list', categories: ['creative', 'professional'], tagline: 'Vidrio esmerilado con profundidad real.' },
  { key: 'purple-neon', name: 'Purple Neon', layout: 'list', categories: ['creative', 'dark'], tagline: 'Neón vibrante para una presencia que no pasa desapercibida.' },
  { key: 'ocean-blue', name: 'Ocean Blue', layout: 'list', categories: ['professional', 'business'], tagline: 'Azules profundos, calma profesional.' },
  { key: 'forest', name: 'Forest', layout: 'grid', categories: ['creative', 'health'], tagline: 'Verdes naturales para marcas con propósito.' },
  { key: 'sunset', name: 'Sunset', layout: 'list', categories: ['creative'], tagline: 'Un degradado cálido de principio a fin.' },
  { key: 'luxury-black', name: 'Luxury Black', layout: 'list', categories: ['dark', 'business', 'fashion'], tagline: 'Negro absoluto con acentos dorados.' },
  { key: 'elegant-gold', name: 'Elegant Gold', layout: 'list', categories: ['fashion', 'business'], tagline: 'Papel crema y oro — elegancia atemporal.' },
  { key: 'modern-startup', name: 'Modern Startup', layout: 'grid', categories: ['business', 'technology'], tagline: 'Gradiente índigo, energía de producto.' },
  { key: 'creator', name: 'Creator', layout: 'grid', categories: ['creative', 'business'], tagline: 'Magenta y púrpura para creadores de contenido.' },
  { key: 'photographer', name: 'Photographer', layout: 'grid', categories: ['creative', 'fashion'], tagline: 'Negro editorial, tu trabajo es la protagonista.' },
  { key: 'doctor', name: 'Doctor', layout: 'list', categories: ['health', 'professional'], tagline: 'Blanco clínico, azul de confianza.' },
  { key: 'restaurant', name: 'Restaurant', layout: 'list', categories: ['restaurant', 'business'], tagline: 'Maderas cálidas y acentos ámbar.' },
  { key: 'agency', name: 'Agency', layout: 'grid', categories: ['business', 'professional'], tagline: 'Tipografía en mayúsculas, actitud de agencia.' },
  { key: 'portfolio', name: 'Portfolio', layout: 'grid', categories: ['creative', 'minimalist'], tagline: 'Blanco y negro — deja hablar al trabajo.' },
  { key: 'fashion', name: 'Fashion', layout: 'grid', categories: ['fashion', 'creative'], tagline: 'Editorial, en blanco y negro, con un acento rosa.' },
  { key: 'corporate', name: 'Corporate', layout: 'list', categories: ['professional', 'business'], tagline: 'Azul corporativo, confianza institucional.' },
  { key: 'tech', name: 'Tech', layout: 'list', categories: ['technology', 'dark'], tagline: 'Cian sobre casi-negro — el futuro es ahora.' },
].map((theme) => ({
  key: theme.key,
  name: theme.name,
  layout: theme.layout,
  baseConfig: { categories: theme.categories, tagline: theme.tagline },
}));

async function main() {
  for (const theme of THEMES) {
    await prisma.theme.upsert({
      where: { key: theme.key },
      update: { name: theme.name, layout: theme.layout, baseConfig: theme.baseConfig },
      create: theme,
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const username = process.env.SEED_USERNAME ?? 'me';
  const displayName = process.env.SEED_DISPLAY_NAME ?? 'Mi Perfil';

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    // emailVerifiedAt se marca desde el seed: este correo lo controla
    // quien despliega la plataforma, no un usuario que se registró solo —
    // no hay un flujo de registro público todavía que deje una cuenta sin
    // verificar (ver auth.service.ts).
    create: { email, passwordHash, role: 'ADMIN', emailVerifiedAt: new Date() },
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, username, displayName },
  });

  const defaultTheme = await prisma.theme.findUniqueOrThrow({
    where: { key: 'aurora' },
  });

  await prisma.appearance.upsert({
    where: { profileId: profile.id },
    update: { themeId: defaultTheme.id },
    create: { profileId: profile.id, themeId: defaultTheme.id },
  });

  // Retira temas de sistema de rondas anteriores que ya no forman parte
  // del catálogo de 20 — seguro porque ninguna Appearance los referencia
  // luego del upsert de arriba (Prisma bloquearía el delete si alguna lo hiciera).
  const currentKeys = THEMES.map((t) => t.key);
  await prisma.theme.deleteMany({
    where: { isSystem: true, key: { notIn: currentKeys } },
  });

  console.log(`Seed completo. Login admin: ${email} / ${password}`);
  console.log(`Perfil público: /${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
