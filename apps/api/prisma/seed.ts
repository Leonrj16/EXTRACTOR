import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const THEMES = [
  {
    key: 'minimal-light',
    name: 'Minimal Claro',
    baseConfig: {
      primaryColor: '#111827',
      backgroundColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
  },
  {
    key: 'minimal-dark',
    name: 'Minimal Oscuro',
    baseConfig: {
      primaryColor: '#f9fafb',
      backgroundColor: '#0a0a0a',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
  },
  {
    key: 'gradient-sunset',
    name: 'Gradiente Sunset',
    baseConfig: {
      primaryColor: '#ffffff',
      backgroundColor: '#f97316',
      buttonStyle: 'pill',
      fontFamily: 'Inter',
    },
  },
];

async function main() {
  for (const theme of THEMES) {
    await prisma.theme.upsert({
      where: { key: theme.key },
      update: { name: theme.name, baseConfig: theme.baseConfig },
      create: theme,
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const username = process.env.SEED_USERNAME ?? 'admin';
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
    where: { key: 'minimal-light' },
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
