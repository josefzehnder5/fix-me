import { useState, useEffect } from "react";
import { tours, type Tour } from "@/data/tours";
import { supabase } from "@/integrations/supabase/client";

type Tab = "touren" | "fotos" | "preise";

// 🔧 Typ für gespeicherte Preise
interface StoredPrice {
  tour_id: number;
  price_display: string;
  price_from_cop: number;
}

// 🔧 Typ für gespeicherte Fotos
interface StoredPhoto {
  tour_id: number;
  photo_url: string;
  is_hero: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("touren");
  const [tourList, setTourList] = useState<Tour[]>(tours);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Passwortschutz
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  // 🚀 Beim Start: gespeicherte Daten laden
  useEffect(() => {
    if (loggedIn) loadSavedData();
  }, [loggedIn]);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      // Preise laden
      const { data: prices } = await supabase.from("tour_prices").select("*");
      // Fotos laden
      const { data: photos } = await supabase.from("tour_photos").select("*");

      if (prices || photos) {
        setTourList(prev =>
          prev.map(tour => {
            let updated = { ...tour };
            // Überschreibe mit gespeicherten Preisen
            const savedPrice = (prices as StoredPrice[])?.find(p => p.tour_id === tour.id);
            if (savedPrice) {
              updated.priceDisplay = savedPrice.price_display;
              updated.priceFromCop = savedPrice.price_from_cop;
            }
            // Überschreibe mit gespeichertem Foto
            const savedPhoto = (photos as StoredPhoto[])?.find(p => p.tour_id === tour.id && p.is_hero);
            if (savedPhoto) {
              updated.heroImage = savedPhoto.photo_url;
            }
            return updated;
          })
        );
        setMessage("✅ Daten aus Supabase geladen");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Fehler beim Laden:", err);
      setMessage("❌ Fehler beim Laden aus Supabase");
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (password === "castle2024") {
      setLoggedIn(true);
      setMessage("");
    } else {
      setMessage("❌ Falsches Passwort");
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", padding: 30, background: "#16213e", borderRadius: 10, textAlign: "center" }}>
        <h1 style={{ color: "#e94560" }}>🔐 Castle Tours Admin</h1>
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ padding: 10, width: "100%", margin: "10px 0", borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff" }}
        />
        <button onClick={handleLogin} style={{ padding: "10px 30px", background: "#e94560", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>
          Einloggen
        </button>
        {message && <p style={{ color: message.includes("❌") ? "#e94560" : "#4ade80", marginTop: 10 }}>{message}</p>}
      </div>
    );
  }

  // 📊 Statistiken
  const stats = {
    total: tourList.length,
    featured: tourList.filter(t => t.featured).length,
    categories: [...new Set(tourList.map(t => t.category))].length,
    avgPrice: Math.round(tourList.reduce((sum, t) => sum + t.priceFromCop, 0) / tourList.length),
  };

  // 💰 Preis speichern (in Supabase!)
  const handlePriceChange = async (tourId: number, field: string, value: string) => {
    const numValue = parseInt(value.replace(/\D/g, "")) || 0;
    
    // Lokal updaten
    setTourList(prev => prev.map(t => {
      if (t.id === tourId) {
        if (field === "priceFromCop") return { ...t, priceFromCop: numValue, priceDisplay: `Desde $${numValue.toLocaleString()}` };
        if (field === "priceDisplay") return { ...t, priceDisplay: value };
        return t;
      }
      return t;
    }));

    // In Supabase speichern
    try {
      await supabase.from("tour_prices").upsert({
        tour_id: tourId,
        price_display: field === "priceDisplay" ? value : `Desde $${numValue.toLocaleString()}`,
        price_from_cop: numValue,
        updated_at: new Date().toISOString(),
      });
      setMessage("✅ Preis gespeichert!");
    } catch (err) {
      setMessage("❌ Fehler beim Speichern");
    }
    setTimeout(() => setMessage(""), 2000);
  };

  // 🖼️ Foto speichern (in Supabase!)
  const handlePhotoChange = async (tourId: number, url: string) => {
    setTourList(prev => prev.map(t => t.id === tourId ? { ...t, heroImage: url } : t));
    
    try {
      await supabase.from("tour_photos").upsert({
        tour_id: tourId,
        photo_url: url,
        is_hero: true,
        uploaded_at: new Date().toISOString(),
      });
      setMessage("✅ Foto gespeichert!");
    } catch (err) {
      setMessage("❌ Fehler beim Speichern");
    }
    setTimeout(() => setMessage(""), 2000);
  };

  // 📤 Foto-Upload zu Supabase Storage
  const handleFileUpload = async (tourId: number, file: File) => {
    setLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `tour-${tourId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("tour-photos")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("tour-photos")
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        await handlePhotoChange(tourId, urlData.publicUrl);
        setMessage("✅ Foto hochgeladen & gespeichert!");
      }
    } catch (err) {
      console.error("Upload-Fehler:", err);
      setMessage("❌ Fehler beim Upload");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", color: "#eee", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#16213e", padding: "15px 30px", borderBottom: "2px solid #0f3460", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ color: "#e94560", fontSize: "1.5em", margin: 0 }}>🏰 Castle Tours Admin</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadSavedData} disabled={loading} style={{ background: "#0f3460", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 5, cursor: "pointer" }}>
            {loading ? "⏳" : "🔄"} Refresh
          </button>
          <a href="/" style={{ color: "#eee", textDecoration: "none", background: "#0f3460", padding: "8px 16px", borderRadius: 5 }}>← Webseite</a>
          <button onClick={() => setLoggedIn(false)} style={{ background: "#555", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 5, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 15, padding: "20px 30px", flexWrap: "wrap" }}>
        {[
          { label: "Touren", value: stats.total },
          { label: "Featured", value: stats.featured },
          { label: "Kategorien", value: stats.categories },
          { label: "Ø Preis", value: `$${stats.avgPrice.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} style={{ background: "#16213e", padding: "15px 25px", borderRadius: 8, textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: "1.8em", color: "#e94560", fontWeight: "bold" }}>{s.value}</div>
            <div style={{ fontSize: "0.85em", color: "#aaa" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 5, padding: "0 30px", marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "touren", label: "🏔️ Touren" },
          { key: "fotos", label: "📸 Fotos" },
          { key: "preise", label: "💰 Preise" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            style={{
              padding: "10px 20px", border: "none", borderRadius: 5, cursor: "pointer",
              background: activeTab === tab.key ? "#e94560" : "#0f3460",
              color: "#fff", fontSize: 14
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div style={{ margin: "0 30px 15px", padding: 10, background: message.includes("❌") ? "#3b1111" : "#113b1f", borderRadius: 5, color: message.includes("❌") ? "#e94560" : "#4ade80" }}>
          {message}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "0 30px 30px" }}>
        {/* 🏔️ Touren Tab */}
        {activeTab === "touren" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ color: "#e94560", margin: 0 }}>Alle Touren ({tourList.length})</h2>
              <button style={{ padding: "10px 20px", background: "#4ade80", color: "#000", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
                + Neue Tour
              </button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {tourList.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #0f3460", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <img src={tour.heroImage} alt={tour.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
                    <div>
                      <strong>{tour.name}</strong>
                      <div style={{ fontSize: "0.8em", color: "#aaa" }}>
                        {tour.duration} • {tour.priceDisplay} • {tour.category} {tour.badge && `• 🔥 ${tour.badge}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditingTour(tour)} style={{ padding: "6px 12px", background: "#0f3460", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>✏️</button>
                    <button style={{ padding: "6px 12px", background: "#3b1111", color: "#e94560", border: "none", borderRadius: 5, cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📸 Fotos Tab */}
        {activeTab === "fotos" && (
          <div>
            <h2 style={{ color: "#e94560", marginBottom: 20 }}>📸 Fotos bearbeiten</h2>
            <p style={{ color: "#aaa", marginBottom: 20 }}>Bild-URL ändern oder neues Bild hochladen.</p>
            <div style={{ display: "grid", gap: 15 }}>
              {tourList.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", alignItems: "center", gap: 15, border: "1px solid #0f3460", flexWrap: "wrap" }}>
                  <img src={tour.heroImage} alt={tour.name} style={{ width: 100, height: 70, borderRadius: 8, objectFit: "cover" }} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <strong>{tour.name}</strong>
                    <input
                      type="text"
                      value={tour.heroImage}
                      onChange={(e) => handlePhotoChange(tour.id, e.target.value)}
                      style={{ width: "100%", padding: 8, marginTop: 5, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff" }}
                    />
                  </div>
                  <label style={{ padding: "8px 16px", background: "#4ade80", color: "#000", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "0.9em" }}>
                    📤 Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(tour.id, file);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 💰 Preise Tab */}
        {activeTab === "preise" && (
          <div>
            <h2 style={{ color: "#e94560", marginBottom: 20 }}>💰 Preise verwalten</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {tourList.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", alignItems: "center", gap: 15, border: "1px solid #0f3460", flexWrap: "wrap" }}>
                  <img src={tour.heroImage} alt={tour.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <strong style={{ fontSize: "0.9em" }}>{tour.name}</strong>
                    <div style={{ fontSize: "0.75em", color: "#aaa" }}>{tour.duration}</div>
                  </div>
                  <input
                    type="text"
                    value={tour.priceDisplay}
                    onChange={(e) => handlePriceChange(tour.id, "priceDisplay", e.target.value)}
                    style={{ width: 150, padding: 8, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff", textAlign: "right" }}
                  />
                  <span style={{ fontSize: "0.8em", color: "#4ade80", minWidth: 100, textAlign: "right" }}>
                    COP ${tour.priceFromCop.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
