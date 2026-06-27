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
    { key: 'team_description', value: 'Mais do que um time de basquete em cadeira de rodas, somos uma família unida pela paixão pelo esporte, pela inclusão e pela superação de desafios. Nossa história é construída diariamente por atletas que transformam dedicação, disciplina e coragem em inspiração dentro e fora das quadras.\n\nAcreditamos que o esporte é uma poderosa ferramenta de transformação social, capaz de promover autonomia, fortalecer a autoestima e criar oportunidades para pessoas com deficiência. Cada treino representa um novo aprendizado, cada jogo é uma chance de evoluir e cada conquista é resultado do esforço coletivo de atletas, comissão técnica, familiares, voluntários, patrocinadores e torcedores.\n\nNossa missão é desenvolver atletas, incentivar a prática do esporte adaptado e mostrar que limites existem para serem superados. Buscamos promover a inclusão, revelar talentos e representar nossa comunidade com orgulho, respeito e espírito esportivo em todas as competições.\n\nVenha conhecer nossa equipe, acompanhar nossa trajetória e fazer parte dessa história. Seja nas arquibancadas, como apoiador ou patrocinador, sua participação fortalece nosso projeto e nos impulsiona a alcançar novos desafios. Juntos, mostramos que a verdadeira força não está apenas em vencer partidas, mas em inspirar pessoas e transformar vidas por meio do esporte.' },
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

  const partnerCount = await prisma.partner.count();
  if (partnerCount === 0) {
    const partners = [
      { name: 'Nashville', imageUrl: '/partners/partner-1.jpeg', sortOrder: 1 },
      { name: 'Lego House', imageUrl: '/partners/partner-2.jpeg', sortOrder: 2 },
      { name: 'Harley-Davidson', imageUrl: '/partners/partner-3.jpeg', sortOrder: 3 },
      { name: 'Dior', imageUrl: '/partners/partner-4.jpeg', sortOrder: 4 },
      { name: 'Surf Coffee', imageUrl: '/partners/partner-5.jpeg', sortOrder: 5 },
      { name: 'Tesla', imageUrl: '/partners/partner-6.jpeg', sortOrder: 6 },
    ];
    for (const p of partners) {
      await prisma.partner.create({ data: p });
    }
    console.log('Parceiros iniciais criados.');
  }

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const events = [
      { title: 'Treino da Semana', schedule: 'Toda terça e quinta', location: 'Ginásio Municipal', imageUrl: '/events/event-1.jpeg', sortOrder: 1 },
      { title: 'Amistoso Preparatório', schedule: '5 de julho', location: 'Arena do Parque', imageUrl: '/events/event-2.jpeg', sortOrder: 2 },
      { title: 'Campeonato Estadual', schedule: '15 a 22 de julho', location: 'São Paulo - SP', imageUrl: '/events/event-3.jpeg', sortOrder: 3 },
      { title: 'Torneio Regional', schedule: '5 de agosto', location: 'Brasília - DF', imageUrl: '/events/event-4.jpeg', sortOrder: 4 },
    ];
    for (const ev of events) {
      await prisma.event.create({ data: ev });
    }
    console.log('Eventos iniciais criados.');
  }

  console.log('Seed concluído com sucesso!');
  console.log('Admin: admin@timebcr.com / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
