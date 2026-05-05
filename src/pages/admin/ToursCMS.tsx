import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tour {
  id: number;
  name: string;
  slug: string;
  duration: string;
  price_from_cop: number;
  hero_image: string;
  is_active: boolean;
  featured: boolean;
  category: string;
}

export default function ToursCMS() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNewTour, setShowNewTour] = useState(false);
  const [newTour, setNewTour] = useState({
    name: '',
    slug: '',
    duration: '',
    price_from_cop: 0,
    hero_image: '',
    category: 'guajira-aventura'
  });

  useEffect(() => {
    if (isAdmin) {
      loadTours();
    }
  }, [isAdmin]);

  async function loadTours() {
    setLoading(true);
    const { data } = await supabase
      .from('tours')
      .select('*')
      .order('id');
    if (data) setTours(data);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === 'CastleTour') {
      setIsAdmin(true);
      setPassword('');
    } else {
      alert('❌ Falsches Passwort');
    }
  }

  async function updateTour(id: number, updates: any) {
    const { error } = await supabase
      .from('tours')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      alert('Fehler: ' + error.message);
    } else {
      loadTours();
    }
  }

  async function deleteTour(id: number) {
    if (confirm('Tour wirklich löschen?')) {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Fehler: ' + error.message);
      } else {
        loadTours();
      }
    }
  }

  async function createNewTour() {
    const slug = newTour.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const { error } = await supabase
      .from('tours')
      .insert([{
        name: newTour.name,
        slug: slug,
        duration: newTour.duration,
        price_from_cop: newTour.price_from_cop,
        hero_image: newTour.hero_image || 'https://placehold.co/600x400/1a472a/white?text=New+Tour',
        category: newTour.category,
        is_active: true,
        featured: false
      }]);
    
    if (error) {
      alert('Fehler: ' + error.message);
    } else {
      setShowNewTour(false);
      setNewTour({ name: '', slug: '', duration: '', price_from_cop: 0, hero_image: '', category: 'guajira-aventura' });
      loadTours();
    }
  }

  async function uploadImage(file: File, tourId: number) {
    const filename = `${tourId}-${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('tour-images')
      .upload(filename, file);
    
    if (uploadError) {
      alert('Fehler beim Hochladen: ' + uploadError.message);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('tour-images')
      .getPublicUrl(filename);
    
    await updateTour(tourId, { hero_image: publicUrl });
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-96">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-800">🏰 Castle Tours</h1>
            <p className="text-gray-600 mt-2">CMS Admin Panel</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800 transition"
            >
              Anmelden
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-4">
            Passwort: <strong className="text-green-700">CastleTour</strong>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600">📂 Touren werden geladen...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-green-800">🗂️ Touren CMS</h1>
        <button
          onClick={() => setShowNewTour(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Neue Tour
        </button>
      </div>

      {/* Neue Tour Modal */}
      {showNewTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-green-800">✨ Neue Tour</h2>
            <input
              type="text"
              placeholder="Name *"
              value={newTour.name}
              onChange={(e) => setNewTour({ ...newTour, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3"
            />
            <input
              type="text"
              placeholder="Dauer (z.B. 2 días / 1 noche)"
              value={newTour.duration}
              onChange={(e) => setNewTour({ ...newTour, duration: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3"
            />
            <input
              type="number"
              placeholder="Preis in COP *"
              value={newTour.price_from_cop || ''}
              onChange={(e) => setNewTour({ ...newTour, price_from_cop: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3"
            />
            <input
              type="text"
              placeholder="Bild-URL (optional)"
              value={newTour.hero_image}
              onChange={(e) => setNewTour({ ...newTour, hero_image: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3"
            />
            <select
              value={newTour.category}
              onChange={(e) => setNewTour({ ...newTour, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="guajira-aventura">🏜️ Guajira Aventura</option>
              <option value="guajira-pasadia">☀️ Guajira Pasadía</option>
              <option value="santa-marta">🌴 Santa Marta</option>
              <option value="todo-incluido">✈️ Todo Incluido</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={createNewTour}
                disabled={!newTour.name || !newTour.price_from_cop}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Erstellen
              </button>
              <button
                onClick={() => setShowNewTour(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Touren Tabelle */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-green-800">Bild</th>
                <th className="p-3 text-left text-sm font-semibold text-green-800">Name</th>
                <th className="p-3 text-left text-sm font-semibold text-green-800">Dauer</th>
                <th className="p-3 text-left text-sm font-semibold text-green-800">Preis (COP)</th>
                <th className="p-3 text-left text-sm font-semibold text-green-800">Kategorie</th>
                <th className="p-3 text-left text-sm font-semibold text-green-800">Aktiv</th>
                <th className="p-3 text-left text-sm font-semibold text-green-800">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {tour.hero_image ? (
                      <img src={tour.hero_image} alt={tour.name} className="w-14 h-14 object-cover rounded-lg" />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">📷</div>
                    )}
                  </td>
                  <td className="p-3 font-medium text-gray-800 max-w-xs">
                    <input
                      type="text"
                      value={tour.name}
                      onChange={(e) => updateTour(tour.id, { name: e.target.value })}
                      className="p-1 border border-gray-300 rounded w-full"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={tour.duration || ''}
                      onChange={(e) => updateTour(tour.id, { duration: e.target.value })}
                      className="p-1 border border-gray-300 rounded w-28"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={tour.price_from_cop || 0}
                      onChange={(e) => updateTour(tour.id, { price_from_cop: parseInt(e.target.value) || 0 })}
                      className="p-1 border border-gray-300 rounded w-32"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={tour.category}
                      onChange={(e) => updateTour(tour.id, { category: e.target.value })}
                      className="p-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="guajira-aventura">🏜️ Aventura</option>
                      <option value="guajira-pasadia">☀️ Pasadía</option>
                      <option value="santa-marta">🌴 Santa Marta</option>
                      <option value="todo-incluido">✈️ Todo Incluido</option>
                    </select
