import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  activeTours: number;
  pendingBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeTours: 0,
    pendingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [tours, setTours] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Buchungen laden
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*');
    
    if (bookings) {
      const total = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const pending = bookings.filter(b => b.status === 'pending').length;
      
      setStats({
        totalBookings: bookings.length,
        totalRevenue: total,
        activeTours: 0,
        pendingBookings: pending
      });
      
      setRecentBookings(bookings.slice(0, 5));
    }
    
    // Touren laden
    const { data: toursData } = await supabase
      .from('tours')
      .select('*')
      .eq('is_active', true);
    
    if (toursData) {
      setTours(toursData);
      setStats(prev => ({ ...prev, activeTours: toursData.length }));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Buchungen</p>
          <p className="text-2xl font-bold">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Umsatz (COP)</p>
          <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Aktive Touren</p>
          <p className="text-2xl font-bold">{stats.activeTours}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Offene Buchungen</p>
          <p className="text-2xl font-bold">{stats.pendingBookings}</p>
        </div>
      </div>
      
      {/* Letzte Buchungen */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Letzte Buchungen</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Kunde</th>
                <th className="text-left p-2">Tour</th>
                <th className="text-left p-2">Datum</th>
                <th className="text-left p-2">Preis</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking: any) => (
                <tr key={booking.id} className="border-b">
                  <td className="p-2">{booking.customer_name}</td>
                  <td className="p-2">{booking.tour_title || '-'}</td>
                  <td className="p-2">{booking.travel_date || '-'}</td>
                  <td className="p-2">${booking.total_price?.toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Bestätigt' :
                       booking.status === 'pending' ? 'Ausstehend' : 'Storniert'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
