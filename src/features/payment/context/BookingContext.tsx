import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Tour } from "@/data/tours";
import { BookingRequestModal } from "../components/BookingRequestModal";

interface BookingState {
  tour: Tour;
  origin?: string;
}

interface Ctx {
  openBooking: (tour: Tour, origin?: string) => void;
}

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState | null>(null);

  const openBooking = useCallback((tour: Tour, origin?: string) => {
    setState({ tour, origin });
  }, []);

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}
      <BookingRequestModal
        tour={state?.tour ?? null}
        origin={state?.origin}
        onClose={() => setState(null)}
      />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
