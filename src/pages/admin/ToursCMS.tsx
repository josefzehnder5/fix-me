import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tour {
  id: number;
  name: string;
  duration: string;
  price_from_cop: number;
  hero_image: string;
  is_active: boolean;
}

export default function ToursCMS() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAdmin) loadTours();
  }, [isAdmin]);

  async function loadTours() {
    setLoading(true);
    const { data } = await supabase.from('tours').select('*').order('id');
    if (data) setTours(data);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === 'CastleTour') {
      setIsAdmin(true);
    } else {
      alert('❌ Contraseña incorrecta');
    }
  }

  async function updateTour(id: number, updates: any) {
    await supabase.from('tours').update(updates).eq('id', id);
    loadTours();
  }

  async function deleteTour(id: number) {
    if (confirm('¿Eliminar este tour?')) {
      await supabase.from('tours').delete().eq('id', id);
      loadTours();
    }
  }

  async function uploadImage(file: File, tourId: number) {
    const filename = `${tourId}-${Date.now()}.jpg`;
    await supabase.storage.from('tour-images').upload(filename, file);
    const { data } = supabase.storage.from('tour-images').getPublicUrl(filename);
    await updateTour(tourId, { hero_image: data.publicUrl });
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-96">
          <h1 className="text-2xl font-bold text-center text-green-800 mb-6">🏰 Castle Tours CMS</h1>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full p-3 border rounded-lg mb-4" autoFocus />
            <button className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800">Ingresar</button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-4">Contraseña: <strong>CastleTour</strong></p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Cargando tours...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">🗂️ Administrar Tours</h1>
      
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50">
            <tr>
              <th className="p-3 text-left">Imagen</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Duración</th>
              <th className="p-3 text-left">Precio (COP)</th>
              <th className="p-3 text-left">Activo</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              <tr key={tour.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {tour.hero_image ? (
                    <img src={tour.hero_image} alt={tour.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">📷</div>
                  )}
                  <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) uploadImage(file, tour.id); }; input.click(); }} className="text-xs text-blue-600 mt-1 block">Subir</button>
                </td>
                <td className="p-3 font-medium">{tour.name}</td>
                <td className="p-3">
                  <input type="text" value={tour.duration || ''} onChange={(e) => updateTour(tour.id, { duration: e.target.value })} className="p-1 border rounded w-28" />
                </td>
                <td className="p-3">
                  <input type="number" value={tour.price_from_cop || 0} onChange={(e) => updateTour(tour.id, { price_from_cop: parseInt(e.target.value) || 0 })} className="p-1 border rounded w-28" />
                </td>
                <td className="p-3">
                  <input type="checkbox" checked={tour.is_active} onChange={(e) => updateTour(tour.id, { is_active: e.target.checked })} />
                </td>
                <td className="p-3">
                  <button onClick={() => deleteTour(tour.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
