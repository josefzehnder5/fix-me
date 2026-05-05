import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Einfacher Login ohne E-Mail
    if (username === 'admin' && password === 'CastleTour') {
      sessionStorage.setItem('admin_logged_in', 'true');
      navigate('/admin');
    } else {
      setError('Falscher Benutzername oder Passwort');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-2">🏰 Castle Tours</h1>
        <p className="text-gray-600 mb-6">Admin Panel</p>
        
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded mb-3"
            required
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-3"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white p-2 rounded hover:bg-green-800"
          >
            Anmelden
          </button>
          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
