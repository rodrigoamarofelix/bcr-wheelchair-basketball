import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@timebcr.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@timebcr.com',
      password: adminPassword,
    },
  });

  const settings = [
    { key: 'team_name', value: 'Time de Basquete em Cadeira de Rodas' },
    { key: 'team_description', value: 'Somos um time de basquete em cadeira de rodas dedicado, competitivo e cheio de garra. Venha nos conhecer!' },
    { key: 'hero_title', value: 'Basquete sem Limites' },
    { key: 'hero_subtitle', value: 'Força, superação e esporte para todos' },
    { key: 'contact_email', value: 'contato@timebcr.com' },
    { key: 'contact_phone', value: '(11) 99999-8888' },
    { key: 'contact_address', value: 'Rua Exemplo, 123 - São Paulo, SP' },
    { key: 'instagram_url', value: '' },
    { key: 'facebook_url', value: '' },
    { key: 'youtube_url', value: '' },
    { key: 'whatsapp_number', value: '' },
  ];

  for (const s of settings) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log('Seed concluído com sucesso!');
  console.log('Admin: admin@timebcr.com / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
