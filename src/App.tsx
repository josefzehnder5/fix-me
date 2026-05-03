import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import { BookingProvider } from "@/features/payment/context/BookingContext";
import IndexPage from "@/pages/Index";
import AuthPage from "@/pages/Auth";
import AdminPaymentsPage from "@/pages/admin/Payments";
import NotFoundPage from "@/pages/NotFound";

export default function App() {
  return (
    <LanguageProvider>
      <BookingProvider>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BookingProvider>
    </LanguageProvider>
  );
}
