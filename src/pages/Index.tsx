import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
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

export default function IndexPage() {
  const [openTour, setOpenTour] = useState<Tour | null>(null);
  const [presetCategory, setPresetCategory] = useState<TourCategory | null>(null);
  const tourGridRef = useRef<HTMLDivElement>(null);

  const handleCategoryPick = (cat: TourCategory) => {
    setPresetCategory(cat);
    setTimeout(() => tourGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <>
      <Helmet>
        <title>Castle Tours — Tours en La Guajira, Punta Gallinas, Cabo de la Vela y Santa Marta</title>
        <meta name="description" content="Tours auténticos por La Guajira, Punta Gallinas, Cabo de la Vela, Tayrona y Santa Marta. Operador local desde 2018. Reserva por WhatsApp en menos de 5 minutos." />
        <meta property="og:title" content="Castle Tours — La Guajira como nunca la has visto" />
        <meta property="og:description" content="Punta Gallinas, Cabo de la Vela, Flamingos rosados, Tayrona. Operador local certificado." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
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
    </>
  );
}
