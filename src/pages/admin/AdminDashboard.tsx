import { useState, useEffect } from "react";
import { tours, type Tour } from "@/data/tours";
import { supabase } from "@/integrations/supabase/client";

type Tab = "touren" | "fotos" | "preise";

interface StoredPrice { tour_id: number; price_display: string; price_from_cop: number; }
interface StoredPhoto { tour_id: number; photo_url: string; is_hero: boolean; }

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("touren");
  const [tourList, setTourList] = useState<Tour[]>(tours);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => { if (loggedIn) loadSavedData(); }, [loggedIn]);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const { data: prices } = await supabase.from("tour_prices").select("*");
      const { data: photos } = await supabase.from("tour_photos").select("*");
      if (prices || photos) {
        setTourList(prev => prev.map(tour => {
          let updated = { ...tour };
          const sp = (prices as StoredPrice[])?.find(p => p.tour_id === tour.id);
          if (sp) { updated.priceDisplay = sp.price_display; updated.priceFromCop = sp.price_from_cop; }
          const ph = (photos as StoredPhoto[])?.find(p => p.tour_id === tour.id && p.is_hero);
          if (ph) { updated.heroImage = ph.photo_url; }
          return updated;
        }));
        setMessage("✅ Daten geladen");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) { setMessage("❌ Fehler beim Laden"); }
    setLoading(false);
  };

  const handleLogin = () => {
    if (password === "castle2024") { setLoggedIn(true); setMessage(""); }
    else { setMessage("❌ Falsches Passwort"); }
  };

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", padding: 30, background: "#16213e", borderRadius: 10, textAlign: "center" }}>
        <h1 style={{ color: "#e94560" }}>🔐 Castle Tours Admin</h1>
        <input type="password" placeholder="Passwort" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ padding: 10, width: "100%", margin: "10px 0", borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff" }} />
        <button onClick={handleLogin} style={{ padding: "10px 30px", background: "#e94560", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>Einloggen</button>
        {message && <p style={{ color: message.includes("❌") ? "#e94560" : "#4ade80", marginTop: 10 }}>{message}</p>}
      </div>
    );
  }

  const stats = {
    total: tourList.length,
    featured: tourList.filter(t => t.featured).length,
    categories: [...new Set(tourList.map(t => t.category))].length,
    avgPrice: Math.round(tourList.reduce((sum, t) => sum + t.priceFromCop, 0) / tourList.length),
  };

  const handlePriceChange = async (tourId: number, field: string, value: string) => {
    const numValue = parseInt(value.replace(/\D/g, "")) || 0;
    setTourList(prev => prev.map(t => {
      if (t.id === tourId) {
        if (field === "priceFromCop") return { ...t, priceFromCop: numValue, priceDisplay: `Desde $${numValue.toLocaleString()}` };
        if (field === "priceDisplay") return { ...t, priceDisplay: value };
      }
      return t;
    }));
    try {
      await supabase.from("tour_prices").upsert({ tour_id: tourId, price_display: field === "priceDisplay" ? value : `Desde $${numValue.toLocaleString()}`, price_from_cop: numValue, updated_at: new Date().toISOString() });
      setMessage("✅ Preis gespeichert!");
    } catch { setMessage("❌ Fehler beim Speichern"); }
    setTimeout(() => setMessage(""), 2000);
  };

  const handlePhotoChange = async (tourId: number, url: string) => {
    setTourList(prev => prev.map(t => t.id === tourId ? { ...t, heroImage: url } : t));
    try {
      await supabase.from("tour_photos").upsert({ tour_id: tourId, photo_url: url, is_hero: true, uploaded_at: new Date().toISOString() });
      setMessage("✅ Foto gespeichert!");
    } catch { setMessage("❌ Fehler beim Speichern"); }
    setTimeout(() => setMessage(""), 2000);
  };

  const handleFileUpload = async (tourId: number, file: File) => {
    setLoading(true);
    setMessage("⏳ Lade hoch...");
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `tour-${tourId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("tour-photos").upload(fileName, file, { cacheControl: "3600", upsert: true });
      if (uploadError) { setMessage("❌ Upload fehlgeschlagen: " + uploadError.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("tour-photos").getPublicUrl(fileName);
      if (urlData?.publicUrl) {
        setTourList(prev => prev.map(t => t.id === tourId ? { ...t, heroImage: urlData.publicUrl } : t));
        await supabase.from("tour_photos").upsert({ tour_id: tourId, photo_url: urlData.publicUrl, is_hero: true, uploaded_at: new Date().toISOString() });
        setMessage("✅ Foto gespeichert!");
      }
    } catch (err: any) { setMessage("❌ Fehler: " + (err.message || "Unbekannt")); }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };
