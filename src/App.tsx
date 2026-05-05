import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import { BookingProvider } from "@/features/payment/context/BookingContext";
import IndexPage from "@/pages/Index";
import AuthPage from "@/pages/Auth";
import AdminPaymentsPage from "@/pages/admin/Payments";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTours from "@/pages/admin/AdminTours";
import AdminCMS from "@/pages/admin/AdminCMS";  // ← NEU
import NotFoundPage from "@/pages/NotFound";

export default function App() {
  return (
    <LanguageProvider>
      <BookingProvider>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tours" element={<AdminTours />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/cms" element={<AdminCMS />} />  {/* ← NEU */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BookingProvider>
    </LanguageProvider>
  );
}
import ToursCMS from '@/pages/admin/ToursCMS';

// Fügen Sie diese Zeile zu den anderen Routes hinzu:
<Route path="/admin/tours-cms" element={<ToursCMS />} />
