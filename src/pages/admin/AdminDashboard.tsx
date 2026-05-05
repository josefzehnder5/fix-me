import { useState } from "react";
import { tours, type Tour } from "@/data/tours";

type Tab = "touren" | "fotos" | "preise";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("touren");
  const [tourList, setTourList] = useState<Tour[]>(tours);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [message, setMessage] = useState("");

  // 🔐 Einfacher Passwortschutz
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "castle2024") { // Ändere dieses Passwort!
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

  // 💰 Preis-Tab
  const handlePriceChange = (tourId: number, field: string, value: string) => {
    setTourList(prev => prev.map(t => {
      if (t.id === tourId) {
        const numValue = parseInt(value.replace(/\D/g, "")) || 0;
        if (field === "priceFromCop") return { ...t, priceFromCop: numValue, priceDisplay: `Desde $${numValue.toLocaleString()}` };
        if (field === "priceDisplay") return { ...t, priceDisplay: value };
        return t;
      }
      return t;
    }));
    setMessage("✅ Preis aktualisiert (lokal)");
    setTimeout(() => setMessage(""), 2000);
  };

  // 🖼️ Foto-Tab
  const handlePhotoChange = (tourId: number, url: string) => {
    setTourList(prev => prev.map(t => t.id === tourId ? { ...t, heroImage: url } : t));
    setMessage("✅ Foto-URL aktualisiert (lokal)");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", color: "#eee", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#16213e", padding: "15px 30px", borderBottom: "2px solid #0f3460", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "#e94560", fontSize: "1.5em", margin: 0 }}>🏰 Castle Tours Admin</h1>
        <div style={{ display: "flex", gap: 15 }}>
          <a href="/" style={{ color: "#eee", textDecoration: "none", background: "#0f3460", padding: "8px 16px", borderRadius: 5 }}>← Zur Webseite</a>
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
      <div style={{ display: "flex", gap: 5, padding: "0 30px", marginBottom: 20 }}>
        {[
          { key: "touren", label: "🏔️ Touren", icon: "🏔️" },
          { key: "fotos", label: "📸 Fotos", icon: "📸" },
          { key: "preise", label: "💰 Preise", icon: "💰" },
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
        {activeTab === "touren" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#e94560", margin: 0 }}>Alle Touren ({tourList.length})</h2>
              <button style={{ padding: "10px 20px", background: "#4ade80", color: "#000", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
                + Neue Tour
              </button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {tourList.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #0f3460" }}>
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

        {activeTab === "fotos" && (
          <div>
            <h2 style={{ color: "#e94560", marginBottom: 20 }}>📸 Fotos bearbeiten</h2>
            <p style={{ color: "#aaa", marginBottom: 20 }}>Füge eine Bild-URL ein oder lade ein neues Bild hoch (Coming Soon).</p>
            <div style={{ display: "grid", gap: 15 }}>
              {tourList.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", alignItems: "center", gap: 15, border: "1px solid #0f3460" }}>
                  <img src={tour.heroImage} alt={tour.name} style={{ width: 100, height: 70, borderRadius: 8, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <strong>{tour.name}</strong>
                    <input
                      type="text"
                      value={tour.heroImage}
                      onChange={(e) => handlePhotoChange(tour.id, e.target.value)}
                      style={{ width: "100%", padding: 8, marginTop: 5, borderRadius: 5, border: "1px solid #0f3460", background: "#1a1a2e", color: "#fff" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "preise" && (
          <div>
            <h2 style={{ color: "#e94560", marginBottom: 20 }}>💰 Preise verwalten</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {tourList.map(tour => (
                <div key={tour.id} style={{ background: "#16213e", padding: 15, borderRadius: 8, display: "flex", alignItems: "center", gap: 15, border: "1px solid #0f3460" }}>
                  <img src={tour.heroImage} alt={tour.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
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
