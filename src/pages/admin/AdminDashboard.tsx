import { useState, useEffect } from "react";
import { tours, type Tour, type TourCategory } from "@/data/tours";
import { supabase } from "@/integrations/supabase/client";

type Pestana = "tours" | "fotos" | "precios";

interface PrecioGuardado { tour_id: number; price_display: string; price_from_cop: number; }
interface FotoGuardada { tour_id: number; photo_url: string; is_hero: boolean; }

export default function PanelAdmin() {
  const [pestanaActiva, setPestanaActiva] = useState<Pestana>("tours");
  const [listaTours, setListaTours] = useState<Tour[]>(tours);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [contrasena, setContrasena] = useState("");
  const [editandoTour, setEditandoTour] = useState<Tour | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => { if (sesionIniciada) cargarDatos(); }, [sesionIniciada]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const { data: precios } = await supabase.from("tour_prices").select("*");
      const { data: fotos } = await supabase.from("tour_photos").select("*");
      const { data: toursDb } = await supabase.from("tours").select("*");
      
      let actualizados = [...tours];
      
      if (toursDb && toursDb.length > 0) {
        actualizados = toursDb.map((td: any) => ({
          id: td.id || actualizados.find(t => t.slug === td.slug)?.id || Date.now(),
          slug: td.slug || "",
          name: td.name || "",
          category: td.category || "santa-marta",
          duration: td.duration || "",
          durationDays: td.duration_days || "",
          priceFromCop: td.price_from_cop || 0,
          priceDisplay: td.price_display || "",
          departureCities: td.departure_cities || [],
          defaultOrigin: td.default_origin || "",
          hook: td.hook || "",
          badge: td.badge || "",
          tags: td.tags || [],
          heroImage: td.hero_image || "",
          highlights: td.highlights || [],
          includes: td.includes || [],
          notIncluded: td.not_included || [],
          itinerary: td.itinerary || [],
          priceTable: td.price_table || null,
          menu: td.menu || null,
          faq: td.faq || [],
          whatToBring: td.what_to_bring || [],
          featured: td.featured || false,
          reviews: [],
        }));
      }
      
      if (precios || fotos) {
        actualizados = actualizados.map(tour => {
          let t = { ...tour };
          const sp = (precios as PrecioGuardado[])?.find(p => p.tour_id === tour.id);
          if (sp) { t.priceDisplay = sp.price_display; t.priceFromCop = sp.price_from_cop; }
          const ph = (fotos as FotoGuardada[])?.find(p => p.tour_id === tour.id && p.is_hero);
          if (ph) { t.heroImage = ph.photo_url; }
          return t;
        });
      }
      
      setListaTours(actualizados);
      setMensaje("✅ Datos cargados");
      setTimeout(() => setMensaje(""), 2000);
    } catch (err) { setMensaje("❌ Error al cargar"); }
    setCargando(false);
  };

  const iniciarSesion = () => {
    if (contrasena === "castle2024") { setSesionIniciada(true); setMensaje(""); }
    else { setMensaje("❌ Contraseña incorrecta"); }
  };

  const guardarTourCompleto = async () => {
    if (!editandoTour) return;
    setCargando(true);
    try {
      const datos = {
        name: editandoTour.name,
        slug: editandoTour.slug,
        category: editandoTour.category,
        duration: editandoTour.duration,
        duration_days: editandoTour.durationDays,
        price_from_cop: editandoTour.priceFromCop,
        price_display: editandoTour.priceDisplay,
        departure_cities: editandoTour.departureCities,
        default_origin: editandoTour.defaultOrigin,
        hook: editandoTour.hook,
        badge: editandoTour.badge,
        tags: editandoTour.tags,
        hero_image: editandoTour.heroImage,
        highlights: editandoTour.highlights,
        includes: editandoTour.includes,
        not_included: editandoTour.notIncluded,
        itinerary: editandoTour.itinerary,
        price_table: editandoTour.priceTable || null,
        menu: editandoTour.menu || null,
        faq: editandoTour.faq,
        what_to_bring: editandoTour.whatToBring,
        featured: editandoTour.featured,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from("tours").upsert(datos);
      if (error) throw error;
      
      setListaTours(prev => prev.map(t => t.id === editandoTour.id ? { ...editandoTour } : t));
      setMensaje("✅ Tour guardado!");
      setMostrarFormulario(false);
      setEditandoTour(null);
    } catch (err: any) {
      setMensaje("❌ Error: " + (err.message || "Desconocido"));
    }
    setCargando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const cambiarPrecio = async (tourId: number, campo: string, valor: string) => {
    const valorNumerico = parseInt(valor.replace(/\D/g, "")) || 0;
    setListaTours(prev => prev.map(t => {
      if (t.id === tourId) {
        if (campo === "priceFromCop") return { ...t, priceFromCop: valorNumerico, priceDisplay: `Desde $${valorNumerico.toLocaleString()}` };
        if (campo === "priceDisplay") return { ...t, priceDisplay: valor };
      }
      return t;
    }));
    try {
      await supabase.from("tour_prices").upsert({ tour_id: tourId, price_display: campo === "priceDisplay" ? valor : `Desde $${valorNumerico.toLocaleString()}`, price_from_cop: valorNumerico, updated_at: new Date().toISOString() });
      setMensaje("✅ Precio guardado");
    } catch { setMensaje("❌ Error al guardar"); }
    setTimeout(() => setMensaje(""), 2000);
  };

  const cambiarFoto = async (tourId: number, url: string) => {
    setListaTours(prev => prev.map(t => t.id === tourId ? { ...t, heroImage: url } : t));
    try {
      await supabase.from("tour_photos").upsert({ tour_id: tourId, photo_url: url, is_hero: true, uploaded_at: new Date().toISOString() });
      setMensaje("✅ Foto guardada");
    } catch { setMensaje("❌ Error al guardar"); }
    setTimeout(() => setMensaje(""), 2000);
  };

  const subirArchivo = async (tourId: number, archivo: File) => {
    setCargando(true);
    setMensaje("⏳ Subiendo...");
    try {
      const extension = archivo.name.split(".").pop() || "jpg";
      const nombreArchivo = `tour-${tourId}-${Date.now()}.${extension}`;
      const { error: errorSubida } = await supabase.storage.from("tour-photos").upload(nombreArchivo, archivo, { cacheControl: "3600", upsert: true });
      if (errorSubida) { setMensaje("❌ Error al subir: " + errorSubida.message); setCargando(false); return; }
      const { data: datosUrl } = supabase.storage.from("tour-photos").getPublicUrl(nombreArchivo);
      if (datosUrl?.publicUrl) {
        setListaTours(prev => prev.map(t => t.id === tourId ? { ...t, heroImage: datosUrl.publicUrl } : t));
        await supabase.from("tour_photos").upsert({ tour_id: tourId, photo_url: datosUrl.publicUrl, is_hero: true, uploaded_at: new Date().toISOString() });
        setMensaje("✅ Foto guardada");
      }
    } catch (err: any) { setMensaje("❌ Error: " + (err.message || "Desconocido")); }
    setCargando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  if (!sesionIniciada) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", padding: 30, background: "#16213e", borderRadius: 10, textAlign: "center" }}>
        <h1 style={{ color: "#e94560" }}>🔐 Castle Tours Admin</h1>
        <input type="password" placeholder="Contraseña" value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && iniciarSesion()}
          style={{ padding: 10, width: "100%", margin: "10px 0", borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff" }} />
        <button onClick={iniciarSesion} style={{ padding: "10px 30px", background: "#e94560", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>Ingresar</button>
        {mensaje && <p style={{ color: mensaje.includes("❌") ? "#e94560" : "#4ade80", marginTop: 10 }}>{mensaje}</p>}
      </div>
    );
  }

  const estadisticas = {
    total: listaTours.length,
    destacados: listaTours.filter(t => t.featured).length,
    categorias: [...new Set(listaTours.map(t => t.category))].length,
    precioPromedio: Math.round(listaTours.reduce((sum, t) => sum + t.priceFromCop, 0) / listaTours.length),
  };

  const categorias: TourCategory[] = ["santa-marta", "guajira-pasadia", "guajira-aventura", "todo-incluido"];
