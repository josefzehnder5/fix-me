import { useRef, useState, useEffect } from "react";
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
import { featuredTours, tours, type Tour, type TourCategory } from "@/data/tours";
import { supabase } from "@/integrations/supabase/client";

export default function IndexPage() {
  const [openTour, setOpenTour] = useState<Tour | null>(null);
  const [presetCategory, setPresetCategory] = useState<TourCategory | null>(null);
  const [mergedFeatured, setMergedFeatured] = useState<Tour[]>(featuredTours);
  const tourGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadOverrides() {
      try {
        const { data: prices } = await supabase.from("tour_prices").select("*");
        const { data: photos } = await supabase.from("tour_photos").select("*");

        if (prices || photos) {
          const updated = tours.map(tour => {
            let t = { ...tour };
            const priceOverride = prices?.find((p: any) => p.tour_id === tour.id);
            if (priceOverride) {
              t.priceDisplay = priceOverride.price_display;
              t.priceFromCop = priceOverride.price_from_cop;
            }
            const photoOverride = photos?.find((p: any) => p.tour_id === tour.id && p.is_hero);
            if (photoOverride) {
              t.heroImage = photoOverride.photo_url;
            }
            return t;
          });
          setMergedFeatured(updated.filter(t => t.featured).slice(0, 6));
        }
      } catch (err) {
        console.error("Supabase-Fehler:", err);
      }
    }
    loadOverrides();
  }, []);

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
        <FeaturedTours tours={mergedFeatured} onOpen={setOpenTour} />
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
