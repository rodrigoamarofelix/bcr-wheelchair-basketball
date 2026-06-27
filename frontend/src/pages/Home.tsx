import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Stats from '../components/Stats';
import Players from '../components/Players';
import News from '../components/News';
import FeaturedVideo from '../components/FeaturedVideo';
import Events from '../components/Events';
import GalleriesList from '../components/GalleriesList';
import GalleryDetail from '../components/GalleryDetail';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import BackToTop from '../components/BackToTop';
import Partners from '../components/Partners';
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
      <Header teamName={settings.team_name} />
      <Hero title={settings.hero_title} subtitle={settings.hero_subtitle} bgImage={settings.hero_background} />
      <Reveal><About description={settings.team_description} /></Reveal>
      <Reveal><Stats /></Reveal>
      <Reveal><Partners /></Reveal>
      <Reveal><Players /></Reveal>
      <Reveal><FeaturedVideo /></Reveal>
      <Reveal><News /></Reveal>
      <Reveal><Events /></Reveal>
      {selectedGallery ? (
        <GalleryDetail gallery={selectedGallery} onClose={() => setSelectedGallery(null)} />
      ) : (
        <Reveal><GalleriesList onSelect={setSelectedGallery} /></Reveal>
      )}
      <WhatsAppButton number={settings.whatsapp_number} />
      <BackToTop />
      <Reveal>
        <Contact
          email={settings.contact_email}
          phone={settings.contact_phone}
          address={settings.contact_address}
          instagram={settings.instagram_url}
          facebook={settings.facebook_url}
          youtube={settings.youtube_url}
        />
      </Reveal>
      <Footer teamName={settings.team_name} />
    </div>
  );
}
