'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Preloader from '@/components/Preloader';
import ScrollTop from '@/components/ScrollTop';
import RequestDialog from '@/components/RequestDialog';
import AiChat from '@/components/AiChat';
import StudioBar from '@/components/StudioBar';
import Metrics from '@/components/Metrics';
import { About, Catalog, Footer, Hero, Partners, Reviews, Services, useLateRefresh } from '@/components/Sections';
import { SmoothScroll } from '@/lib/scroll';

export default function Page() {
  const [pct, setPct] = useState(0);
  // never hold the page behind the preloader for long
  useEffect(() => {
    if (window.scrollY > 300) { setPct(100); return; }
    const id = setTimeout(() => setPct(100), 1800);
    return () => clearTimeout(id);
  }, []);
  return (
    <>
      <Preloader pct={pct} />
      <Header />
      <ScrollTop />
      <RequestDialog />
      <AiChat />
      <StudioBar />
      <Metrics />
      <SmoothScroll><Content onLoadProgress={(v) => setPct((p) => Math.max(p, v))} /></SmoothScroll>
    </>
  );
}

function Content({ onLoadProgress }: { onLoadProgress: (v: number) => void }) {
  useLateRefresh();
  return (
    <main>
      {/* screen-high blocks: the dark ones (hero, reviews) stay put while the next rides up over them;
          the contacts form and the footer close the page as one block */}
      <Hero onLoadProgress={onLoadProgress} />
      <Services />
      <About />
      <Catalog />
      <Reviews />
      <Partners />
      <Footer />
    </main>
  );
}
