import { useState, useEffect } from "react";
import { tours, type Tour } from "@/data/tours";
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

  useEffect(() => { if (sesionIniciada) cargarDatos(); }, [sesionIniciada]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const { data: precios } = await supabase.from("tour_prices").select("*");
      const { data: fotos } = await supabase.from("tour_photos").select("*");
      if (precios || fotos) {
        setListaTours(prev => prev.map(tour => {
          let actualizado = { ...tour };
          const sp = (precios as PrecioGuardado[])?.find(p => p.tour_id === tour.id);
          if (sp) { actualizado.priceDisplay = sp.price_display; actualizado.priceFromCop = sp.price_from_cop; }
          const ph = (fotos as FotoGuardada[])?.find(p => p.tour_id === tour.id && p.is_hero);
          if (ph) { actualizado.heroImage = ph.photo_url; }
          return actualizado;
        }));
        setMensaje("✅ Datos cargados");
        setTimeout(() => setMensaje(""), 2000);
      }
    } catch (err) { setMensaje("❌ Error al cargar"); }
    setCargando(false);
  };

  const iniciarSesion = () => {
    if (contrasena === "castle2024") { setSesionIniciada(true); setMensaje(""); }
    else { setMensaje("❌ Contraseña incorrecta"); }
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
          <button key={pestana.key} onClick={() => setPestanaActiva(pestana.key as Pestana)}
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
        {pestanaActiva === "tours" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#e94560", margin: 0 }}>Todos los tours ({listaTours.length})</h2>
              <button style={{ padding: "10px 20px", background: "#4ade80", color: "#000", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>+ Nuevo tour</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {listaTours.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #0f3460", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <img src={tour.heroImage} alt={tour.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
                    <div>
                      <strong>{tour.name}</strong>
                      <div style={{ fontSize: "0.8em", color: "#aaa" }}>{tour.duration} • {tour.priceDisplay} • {tour.category} {tour.badge && `• 🔥 ${tour.badge}`}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: "6px 12px", background: "#0f3460", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>✏️ Editar</button>
                    <button style={{ padding: "6px 12px", background: "#3b1111", color: "#e94560", border: "none", borderRadius: 5, cursor: "pointer" }}>🗑️ Eliminar</button>
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
                  <img src={tour.heroImage} alt={tour.name} style={{ width: 100, height: 70, borderRadius: 8, objectFit: "cover" }} />
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
                  <img src={tour.heroImage} alt={tour.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
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
