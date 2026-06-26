import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';

const router = Router();

router.get('/news.xml', async (_req: Request, res: Response) => {
  try {
    const news = await prisma.news.findMany({
      where: { published: true, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const siteUrl = process.env.SITE_URL || 'https://seudominio.com.br';

    const items = news.map((n) => `
    <item>
      <title><![CDATA[${n.title}]]></title>
      <link>${siteUrl}/noticias/${n.id}</link>
      <guid>${siteUrl}/noticias/${n.id}</guid>
      <pubDate>${new Date(n.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${n.content.slice(0, 300)}]]></description>
      ${n.imageUrl ? `<enclosure url="${n.imageUrl}" type="image/jpeg" />` : ''}
    </item>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BCR - Basquete em Cadeira de Rodas</title>
    <link>${siteUrl}</link>
    <description>Força, superação e esporte para todos</description>
    <language>pt-br</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss/news.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar RSS');
  }
});

export default router;
