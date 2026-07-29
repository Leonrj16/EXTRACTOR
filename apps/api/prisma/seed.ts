import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const THEMES = [
  {
    key: 'minimal-light',
    name: 'Minimal Claro',
    layout: 'list',
    baseConfig: {
      primaryColor: '#111827',
      backgroundColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
      animation: 'fade',
    },
  },
  {
    key: 'minimal-dark',
    name: 'Minimal Oscuro',
    layout: 'list',
    baseConfig: {
      primaryColor: '#f9fafb',
      backgroundColor: '#0a0a0a',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
      animation: 'fade',
    },
  },
  {
    key: 'gradient-sunset',
    name: 'Gradiente Sunset',
    layout: 'list',
    baseConfig: {
      primaryColor: '#ffffff',
      backgroundColor: '#f97316',
      buttonStyle: 'pill',
      fontFamily: 'Inter',
      animation: 'slide',
    },
  },
  {
    key: 'grid-showcase',
    name: 'Grid Showcase',
    layout: 'grid',
    baseConfig: {
      primaryColor: '#111827',
      backgroundColor: '#f4f4f5',
      buttonStyle: 'square',
      fontFamily: 'Space Grotesk',
      animation: 'bounce',
    },
  },
  {
    key: 'aura-glow',
    name: 'Aura Glow',
    layout: 'list',
    baseConfig: {
      primaryColor: '#f4f5fb',
      backgroundColor: '#07080c',
      buttonStyle: 'pill',
      fontFamily: 'Space Grotesk',
      animation: 'bounce',
      aurora: true,
    },
  },
];

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
    create: { email, passwordHash, role: 'ADMIN' },
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, username, displayName },
  });

  const defaultTheme = await prisma.theme.findUniqueOrThrow({
    where: { key: 'aura-glow' },
  });

  await prisma.appearance.upsert({
    where: { profileId: profile.id },
    update: {},
    create: { profileId: profile.id, themeId: defaultTheme.id },
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
