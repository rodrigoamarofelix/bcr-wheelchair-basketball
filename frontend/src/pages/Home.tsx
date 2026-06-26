import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Players from '../components/Players';
import Matches from '../components/Matches';
import News from '../components/News';
import GalleriesList from '../components/GalleriesList';
import GalleryDetail from '../components/GalleryDetail';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import BackToTop from '../components/BackToTop';
import Reveal from '../components/Reveal';
import { api } from '../api/client';
import type { Gallery } from '../components/GalleriesList';

export default function Home() {
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    api.settings.get().then(setSettings).catch(console.error);
  }, []);

  return (
    <div id="main-content">
      <Header />
      <Hero />
      <Reveal><About /></Reveal>
      <Reveal><Players /></Reveal>
      <Reveal><Matches /></Reveal>
      <Reveal><News /></Reveal>
      {selectedGallery ? (
        <GalleryDetail gallery={selectedGallery} onClose={() => setSelectedGallery(null)} />
      ) : (
        <Reveal><GalleriesList onSelect={setSelectedGallery} /></Reveal>
      )}
      <WhatsAppButton number={settings.whatsapp_number} />
      <BackToTop />
      <Reveal>      <Contact
        email={settings.contact_email}
        phone={settings.contact_phone}
        address={settings.contact_address}
        instagram={settings.instagram_url}
        facebook={settings.facebook_url}
        youtube={settings.youtube_url}
      /></Reveal>
      <Footer teamName={settings.team_name} />
    </div>
  );
}
