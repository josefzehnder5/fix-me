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
  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", color: "#eee", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "#16213e", padding: "15px 30px", borderBottom: "2px solid #0f3460", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ color: "#e94560", fontSize: "1.5em", margin: 0 }}>🏰 Castle Tours Admin</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={cargarDatos} disabled={cargando} style={{ background: "#0f3460", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 5, cursor: "pointer" }}>{cargando ? "⏳" : "🔄"} Actualizar</button>
          <a href="/" style={{ color: "#eee", textDecoration: "none", background: "#0f3460", padding: "8px 16px", borderRadius: 5 }}>← Sitio web</a>
          <button onClick={() => setSesionIniciada(false)} style={{ background: "#555", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 5, cursor: "pointer" }}>Cerrar sesión</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 15, padding: "20px 30px", flexWrap: "wrap" }}>
        {[{ label: "Tours", value: estadisticas.total }, { label: "Destacados", value: estadisticas.destacados }, { label: "Categorías", value: estadisticas.categorias }, { label: "Precio prom.", value: `$${estadisticas.precioPromedio.toLocaleString()}` }].map(s => (
          <div key={s.label} style={{ background: "#16213e", padding: "15px 25px", borderRadius: 8, textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: "1.8em", color: "#e94560", fontWeight: "bold" }}>{s.value}</div>
            <div style={{ fontSize: "0.85em", color: "#aaa" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 5, padding: "0 30px", marginBottom: 20, flexWrap: "wrap" }}>
        {[{ key: "tours", label: "🏔️ Tours" }, { key: "fotos", label: "📸 Fotos" }, { key: "precios", label: "💰 Precios" }].map(pestana => (
          <button key={pestana.key} onClick={() => { setPestanaActiva(pestana.key as Pestana); setMostrarFormulario(false); }}
            style={{ padding: "10px 20px", border: "none", borderRadius: 5, cursor: "pointer", background: pestanaActiva === pestana.key ? "#e94560" : "#0f3460", color: "#fff", fontSize: 14 }}>
            {pestana.label}
          </button>
        ))}
      </div>

      {mensaje && (
        <div style={{ margin: "0 30px 15px", padding: 10, background: mensaje.includes("❌") ? "#3b1111" : "#113b1f", borderRadius: 5, color: mensaje.includes("❌") ? "#e94560" : "#4ade80" }}>
          {mensaje}
        </div>
      )}

      <div style={{ padding: "0 30px 30px" }}>
        {mostrarFormulario && editandoTour && (
          <div style={{ background: "#16213e", padding: 25, borderRadius: 10, marginBottom: 20, border: "2px solid #e94560" }}>
            <h2 style={{ color: "#e94560", marginBottom: 20 }}>✏️ Editar: {editandoTour.name}</h2>
            <div style={{ display: "grid", gap: 12, maxWidth: 800 }}>
              <div>
                <label style={{ color: "#aaa", fontSize: "0.85em" }}>Nombre</label>
                <input type="text" value={editandoTour.name} onChange={(e) => setEditandoTour({ ...editandoTour, name: e.target.value })}
                  style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ color: "#aaa", fontSize: "0.85em" }}>Slug</label>
                  <input type="text" value={editandoTour.slug} onChange={(e) => setEditandoTour({ ...editandoTour, slug: e.target.value })}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: "0.85em" }}>Categoría</label>
                  <select value={editandoTour.category} onChange={(e) => setEditandoTour({ ...editandoTour, category: e.target.value as TourCategory })}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }}>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: "0.85em" }}>Duración</label>
                  <input type="text" value={editandoTour.duration} onChange={(e) => setEditandoTour({ ...editandoTour, duration: e.target.value })}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: "0.85em" }}>Duración (días)</label>
                  <input type="text" value={editandoTour.durationDays} onChange={(e) => setEditandoTour({ ...editandoTour, durationDays: e.target.value })}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: "0.85em" }}>Precio (COP)</label>
                  <input type="number" value={editandoTour.priceFromCop} onChange={(e) => setEditandoTour({ ...editandoTour, priceFromCop: parseInt(e.target.value) || 0, priceDisplay: `Desde $${parseInt(e.target.value)?.toLocaleString() || "0"}` })}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: "0.85em" }}>Precio (texto)</label>
                  <input type="text" value={editandoTour.priceDisplay} onChange={(e) => setEditandoTour({ ...editandoTour, priceDisplay: e.target.value })}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
                </div>
              </div>
              <div>
                <label style={{ color: "#aaa", fontSize: "0.85em" }}>Descripción (hook)</label>
                <textarea value={editandoTour.hook} onChange={(e) => setEditandoTour({ ...editandoTour, hook: e.target.value })}
                  rows={3} style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ color: "#aaa", fontSize: "0.85em" }}>Badge</label>
                  <input type="text" value={editandoTour.badge || ""} onChange={(e) => setEditandoTour({ ...editandoTour, badge: e.target.value })}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ color: "#aaa", fontSize: "0.85em" }}>Origen</label>
                  <input type="text" value={editandoTour.defaultOrigin} onChange={(e) => setEditandoTour({ ...editandoTour, defaultOrigin: e.target.value })}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
                </div>
              </div>
              <div>
                <label style={{ color: "#aaa", fontSize: "0.85em" }}>Imagen (URL)</label>
                <input type="text" value={editandoTour.heroImage} onChange={(e) => setEditandoTour({ ...editandoTour, heroImage: e.target.value })}
                  style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", marginTop: 4 }} />
                {editandoTour.heroImage && <img src={editandoTour.heroImage} alt="Preview" style={{ width: 150, borderRadius: 8, marginTop: 8 }} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
                <input type="checkbox" checked={editandoTour.featured} onChange={(e) => setEditandoTour({ ...editandoTour, featured: e.target.checked })}
                  style={{ width: 20, height: 20 }} />
                <label style={{ color: "#aaa", fontSize: "0.9em" }}>Destacado (Featured)</label>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                <button onClick={guardarTourCompleto} disabled={cargando}
                  style={{ padding: "12px 30px", background: "#4ade80", color: "#000", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "1em" }}>
                  {cargando ? "⏳ Guardando..." : "💾 Guardar tour"}
                </button>
                <button onClick={() => { setMostrarFormulario(false); setEditandoTour(null); }}
                  style={{ padding: "12px 30px", background: "#555", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {pestanaActiva === "tours" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#e94560", margin: 0 }}>Todos los tours ({listaTours.length})</h2>
              <button onClick={() => {
                const nuevo: Tour = { id: Date.now(), slug: "", name: "Nuevo Tour", category: "santa-marta", duration: "1 día", durationDays: "1 día", priceFromCop: 0, priceDisplay: "Desde $0", departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta", hook: "", tags: [], heroImage: "", highlights: [], includes: [], notIncluded: [], itinerary: [], faq: [], whatToBring: [], featured: false };
                setEditandoTour(nuevo); setMostrarFormulario(true);
              }} style={{ padding: "10px 20px", background: "#4ade80", color: "#000", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>+ Nuevo tour</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {listaTours.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #0f3460", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <img src={tour.heroImage || "https://via.placeholder.com/60"} alt={tour.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
                    <div>
                      <strong>{tour.name}</strong>
                      <div style={{ fontSize: "0.8em", color: "#aaa" }}>{tour.duration} • {tour.priceDisplay} • {tour.category} {tour.badge && `• 🔥 ${tour.badge}`}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setEditandoTour({ ...tour }); setMostrarFormulario(true); }}
                      style={{ padding: "6px 12px", background: "#0f3460", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>✏️ Editar</button>
                    <button onClick={async () => {
                      if (confirm("¿Eliminar este tour?")) {
                        await supabase.from("tours").delete().eq("id", tour.id);
                        setListaTours(prev => prev.filter(t => t.id !== tour.id));
                        setMensaje("✅ Tour eliminado");
                        setTimeout(() => setMensaje(""), 2000);
                      }
                    }} style={{ padding: "6px 12px", background: "#3b1111", color: "#e94560", border: "none", borderRadius: 5, cursor: "pointer" }}>🗑️ Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pestanaActiva === "fotos" && (
          <div>
            <h2 style={{ color: "#e94560", marginBottom: 20 }}>📸 Editar fotos</h2>
            <p style={{ color: "#aaa", marginBottom: 20 }}>Cambia la URL de la imagen o sube una nueva foto.</p>
            <div style={{ display: "grid", gap: 15 }}>
              {listaTours.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", alignItems: "center", gap: 15, border: "1px solid #0f3460", flexWrap: "wrap" }}>
                  <img src={tour.heroImage || "https://via.placeholder.com/100"} alt={tour.name} style={{ width: 100, height: 70, borderRadius: 8, objectFit: "cover" }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <strong>{tour.name}</strong>
                    <input type="text" value={tour.heroImage}
                      onChange={(e) => cambiarFoto(tour.id, e.target.value)}
                      style={{ width: "100%", padding: 8, marginTop: 5, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff" }} />
                  </div>
                  <label style={{ padding: "10px 18px", background: "#4ade80", color: "#000", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "0.9em", whiteSpace: "nowrap" }}>
                    📤 Subir foto
                    <input type="file" accept="image/*"
                      onChange={(e) => { const archivo = e.target.files?.[0]; if (archivo) subirArchivo(tour.id, archivo); }}
                      style={{ display: "none" }} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {pestanaActiva === "precios" && (
          <div>
            <h2 style={{ color: "#e94560", marginBottom: 20 }}>💰 Gestionar precios</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {listaTours.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", alignItems: "center", gap: 15, border: "1px solid #0f3460", flexWrap: "wrap" }}>
                  <img src={tour.heroImage || "https://via.placeholder.com/50"} alt={tour.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <strong style={{ fontSize: "0.9em" }}>{tour.name}</strong>
                    <div style={{ fontSize: "0.75em", color: "#aaa" }}>{tour.duration}</div>
                  </div>
                  <input type="text" value={tour.priceDisplay}
                    onChange={(e) => cambiarPrecio(tour.id, "priceDisplay", e.target.value)}
                    style={{ width: 150, padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", textAlign: "right" }} />
                  <span style={{ fontSize: "0.8em", color: "#4ade80", minWidth: 100, textAlign: "right" }}>COP ${tour.priceFromCop.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
                                                 }
