import { useEffect, useState, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/payment/hooks/useAuth";
import {
  createPaymentLinkForBooking,
  updateBookingStatus,
} from "@/features/payment/server/payment.functions";
import {
  buildConfirmationMessage,
  buildPaymentLinkMessage,
  COP,
  normalizeLang,
} from "@/features/payment/lib/payment";
import { buildWaLinkToCustomer } from "@/lib/whatsapp";
import type { Database } from "@/integrations/supabase/types";

type BookingRow = Database["public"]["Tables"]["booking_requests"]["Row"];

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Admin · Pagos · Castle Tours" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const { session, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !session) {
      navigate({ to: "/auth" });
    }
  }, [authLoading, session, navigate]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--color-muted-foreground)]" />
      </main>
    );
  }

  if (!session) return null;

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--color-paper)] px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <h1 className="font-display text-2xl">Acceso restringido</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
            Tu cuenta ({session.user.email}) no tiene rol de administrador. Pídele al propietario
            del sitio que te asigne el rol <code className="rounded bg-[color:var(--color-paper-warm)] px-1.5 py-0.5">admin</code> en
            la tabla <code className="rounded bg-[color:var(--color-paper-warm)] px-1.5 py-0.5">user_roles</code>.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-6 rounded-full bg-[color:var(--color-ink)] px-5 py-2 text-sm text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "link_sent" | "paid">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createLinkFn = useServerFn(createPaymentLinkForBooking);
  const updateStatusFn = useServerFn(updateBookingStatus);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setRows(data ?? []);
      setErrorMsg(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    // Realtime updates so 'paid' status appears live after webhook
    const channel = supabase
      .channel("booking-requests-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "booking_requests" },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);

  const handleCreateLink = async (row: BookingRow) => {
    setBusyId(row.id);
    setErrorMsg(null);
    try {
      const res = await createLinkFn({ data: { bookingRequestId: row.id } });
      // copy to clipboard
      await navigator.clipboard.writeText(res.url).catch(() => {});
      await load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error generando link");
    } finally {
      setBusyId(null);
    }
  };

  const handleStatus = async (row: BookingRow, status: BookingRow["status"]) => {
    setBusyId(row.id);
    try {
      await updateStatusFn({ data: { bookingRequestId: row.id, status } });
      await load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error actualizando");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[color:var(--color-paper)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/" className="text-xs text-[color:var(--color-muted-foreground)] hover:underline">
              ← Sitio público
            </Link>
            <h1 className="mt-1 font-display text-3xl">Panel de pagos</h1>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Solicitudes de reserva y enlaces Wompi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm hover:bg-[color:var(--color-paper-warm)]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refrescar
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm hover:bg-[color:var(--color-paper-warm)]"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", "pending", "link_sent", "paid"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "bg-[color:var(--color-ink)] text-white"
                  : "bg-white text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-warm)]"
              }`}
            >
              {f === "all"
                ? `Todas (${rows.length})`
                : f === "pending"
                ? `Pendientes (${rows.filter((r) => r.status === "pending").length})`
                : f === "link_sent"
                ? `Link enviado (${rows.filter((r) => r.status === "link_sent").length})`
                : `Pagadas (${rows.filter((r) => r.status === "paid").length})`}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</div>
        )}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[color:var(--color-muted-foreground)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center text-sm text-[color:var(--color-muted-foreground)]">
              Sin solicitudes en este filtro.
            </div>
          ) : (
            filtered.map((row) => (
              <BookingCard
                key={row.id}
                row={row}
                busy={busyId === row.id}
                onCreateLink={() => handleCreateLink(row)}
                onMarkPaid={() => handleStatus(row, "paid")}
                onCancel={() => handleStatus(row, "cancelled")}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function BookingCard({
  row,
  busy,
  onCreateLink,
  onMarkPaid,
  onCancel,
}: {
  row: BookingRow;
  busy: boolean;
  onCreateLink: () => void;
  onMarkPaid: () => void;
  onCancel: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const lang = normalizeLang(row.language);

  const copyUrl = async () => {
    if (!row.wompi_payment_url) return;
    await navigator.clipboard.writeText(row.wompi_payment_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const waPaymentLink = row.wompi_payment_url
    ? buildWaLinkToCustomer(
        row.customer_phone,
        buildPaymentLinkMessage({
          lang,
          tourName: row.tour_name,
          persons: row.persons,
          date: row.desired_date,
          depositAmount: row.deposit_amount_cop,
          depositPercent: row.deposit_percent,
          totalAmount: row.total_price_cop,
          paymentUrl: row.wompi_payment_url,
        })
      )
    : null;

  const waConfirmation = row.wompi_transaction_id
    ? buildWaLinkToCustomer(
        row.customer_phone,
        buildConfirmationMessage({
          lang,
          tourName: row.tour_name,
          date: row.desired_date,
          transactionId: row.wompi_transaction_id,
          customerName: row.customer_name,
        })
      )
    : null;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={row.status} />
            <span className="text-xs text-[color:var(--color-muted-foreground)]">
              {new Date(row.created_at).toLocaleString("es-CO", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
            <span className="text-xs text-[color:var(--color-muted-foreground)]">
              · {lang.toUpperCase()}
            </span>
          </div>
          <h3 className="mt-1 font-display text-lg">{row.tour_name}</h3>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            {row.customer_name} · {row.customer_phone}
            {row.customer_email ? ` · ${row.customer_email}` : ""}
          </p>
          <p className="text-xs text-[color:var(--color-muted-foreground)]">
            {row.persons} pax
            {row.desired_date ? ` · ${row.desired_date}` : ""}
            {row.origin ? ` · desde ${row.origin}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted-foreground)]">
            Anticipo {row.deposit_percent}%
          </p>
          <p className="font-display text-xl text-[color:var(--color-terracotta)]">
            {COP(row.deposit_amount_cop)}
          </p>
          <p className="text-[10px] text-[color:var(--color-muted-foreground)]">
            de {COP(row.total_price_cop)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {row.status === "pending" && (
          <button
            onClick={onCreateLink}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-ink)] px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Generar link Wompi
          </button>
        )}

        {row.wompi_payment_url && (
          <>
            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-xs hover:bg-[color:var(--color-paper-warm)]"
            >
              <Copy className="h-3.5 w-3.5" /> {copied ? "Copiado" : "Copiar link"}
            </button>
            <a
              href={row.wompi_payment_url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-xs hover:bg-[color:var(--color-paper-warm)]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Abrir
            </a>
            {waPaymentLink && (
              <a
                href={waPaymentLink}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-whatsapp)] px-3 py-2 text-xs font-medium text-white hover:brightness-110"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Enviar por WhatsApp
              </a>
            )}
            {row.status === "link_sent" && (
              <button
                onClick={onCreateLink}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-xs hover:bg-[color:var(--color-paper-warm)] disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-generar
              </button>
            )}
          </>
        )}

        {row.status === "paid" && waConfirmation && (
          <a
            href={waConfirmation}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-whatsapp)] px-3 py-2 text-xs font-medium text-white hover:brightness-110"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Enviar confirmación
          </a>
        )}

        {row.status !== "paid" && row.status !== "cancelled" && (
          <>
            <button
              onClick={onMarkPaid}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 hover:bg-green-100 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Marcar pagada
            </button>
            <button
              onClick={onCancel}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-xs text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-paper-warm)] disabled:opacity-60"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancelar
            </button>
          </>
        )}
      </div>

      {row.wompi_transaction_id && (
        <p className="mt-3 text-[11px] text-[color:var(--color-muted-foreground)]">
          Tx: {row.wompi_transaction_id}
          {row.paid_at && ` · pagada ${new Date(row.paid_at).toLocaleString("es-CO")}`}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: BookingRow["status"] }) {
  const cfg = {
    pending: { bg: "bg-amber-100", text: "text-amber-800", icon: Clock, label: "Pendiente" },
    link_sent: { bg: "bg-blue-100", text: "text-blue-800", icon: Send, label: "Link enviado" },
    paid: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2, label: "Pagada" },
    cancelled: { bg: "bg-gray-100", text: "text-gray-700", icon: XCircle, label: "Cancelada" },
  }[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}
