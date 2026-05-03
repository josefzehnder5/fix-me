import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { QuickFinder } from "@/components/site/QuickFinder";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { FeaturedTours } from "@/components/site/FeaturedTours";
import { TourGrid } from "@/components/site/TourGrid";
import { TourModal } from "@/components/site/TourModal";
import { WhyUs } from "@/components/site/WhyUs";
import { StickyWhatsApp } from "@/components/site/StickyWhatsApp";
import { Footer } from "@/components/site/Footer";
import { LanguageModal } from "@/components/site/LanguageModal";
import { featuredTours, type Tour, type TourCategory } from "@/data/tours";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Castle Tours — Tours en La Guajira, Punta Gallinas, Cabo de la Vela y Santa Marta" },
      { name: "description", content: "Tours auténticos por La Guajira, Punta Gallinas, Cabo de la Vela, Tayrona y Santa Marta. Operador local desde 2018. Reserva por WhatsApp en menos de 5 minutos." },
      { property: "og:title", content: "Castle Tours — La Guajira como nunca la has visto" },
      { property: "og:description", content: "Punta Gallinas, Cabo de la Vela, Flamingos rosados, Tayrona. Operador local certificado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  const [openTour, setOpenTour] = useState<Tour | null>(null);
  const [presetCategory, setPresetCategory] = useState<TourCategory | null>(null);
  const tourGridRef = useRef<HTMLDivElement>(null);

  const handleCategoryPick = (cat: TourCategory) => {
    setPresetCategory(cat);
    setTimeout(() => tourGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <main className="min-h-screen bg-[color:var(--color-paper)]">
      <Hero />
      <QuickFinder onOpen={setOpenTour} />
      <CategoryGrid onPick={handleCategoryPick} />
      <FeaturedTours tours={featuredTours} onOpen={setOpenTour} />
      <TourGrid ref={tourGridRef} onOpen={setOpenTour} presetCategory={presetCategory} />
      <WhyUs />
      <Footer />
      <StickyWhatsApp />
      <TourModal tour={openTour} onClose={() => setOpenTour(null)} />
      <LanguageModal />
    </main>
  );
}
