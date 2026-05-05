import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!sessionStorage.getItem('admin_logged_in')) {
      navigate('/admin/login');
    }
  }, [navigate]);
  
  // ... Rest Ihres Codes
}
