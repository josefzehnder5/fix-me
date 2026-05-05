import { useState } from 'react';
import { useNavigate } location } from 'react-router-dom';

export default function AuthPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nur Passwort-Check - KEINE E-MAIL!
    if (password === 'CastleTour') {
      sessionStorage.setItem('admin_logged_in', 'true');
      navigate('/admin');
    } else {
      setError('❌ Falsches Passwort');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-green-700">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">🏰 Castle Tours</h1>
          <p className="text-gray-600 mt-2">Admin Panel</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Passwort eingeben"
              autoFocus
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800"
          >
            Anmelden
          </button>
          
          {error && (
            <p className="text-red-500 mt-4 text-center">{error}</p>
          )}
        </form>
        
        <p className="text-center text-gray-500 text-sm mt-6">
          Passwort: <strong>CastleTour</strong>
        </p>
      </div>
    </div>
  );
}
