# Wompi Payment Add-on

Erzwingt eine Wompi-Anzahlung, bevor eine Castle-Tours-Buchung bestätigt wird.

## Flow

1. Kunde klickt auf einer Tour-Karte/-Modal auf **WhatsApp / Reservar**.
2. Statt direkt WhatsApp zu öffnen, erscheint das **`BookingRequestModal`** mit einem Mini-Formular (Name, WhatsApp, Personen, Datum, Email).
3. Beim Absenden:
   - die Anfrage wird in `public.booking_requests` (Lovable Cloud) gespeichert,
   - WhatsApp öffnet sich mit einer vorausgefüllten Nachricht inkl. **Zahlungshinweis** und der Anfrage-Referenz.
4. Der Operator öffnet `/admin/payments`, sieht die Anfrage und klickt **„Generar link Wompi"**.
   - Eine Server-Function ruft `POST https://sandbox.wompi.co/v1/payment_links` auf.
   - Der Link wird in der Buchung gespeichert; Status → `link_sent`.
   - Operator kopiert den Link oder öffnet WhatsApp mit vorausgefüllter Nachricht in der Sprache des Kunden (es/en).
5. Kunde zahlt → Wompi schickt `transaction.updated` an `/api/public/wompi-webhook`.
   - Signatur (SHA-256 nach Wompi-Schema) wird verifiziert.
   - Idempotenz via Tabelle `wompi_events` (event_id = `<tx_id>:<timestamp>`).
   - Bei `APPROVED` → Buchung wird auf `paid` gesetzt.
6. Im Admin erscheint **„Enviar confirmación"** → öffnet WhatsApp mit Bestätigungstext und Buchungsnummer.

> Ohne Bestätigung über das Webhook bleibt die Buchung `link_sent` — keine automatische Bestätigung wird versendet.

## Ordnerstruktur

```
src/features/payment/
  components/BookingRequestModal.tsx   ← Kundenformular
  context/BookingContext.tsx           ← öffnet das Modal aus jedem Tour-CTA
  hooks/useAuth.ts                     ← Supabase-Session + Admin-Rolle
  lib/payment.ts                       ← Anzahlungslogik, Nachrichtenvorlagen (es/en)
  server/wompi.server.ts               ← Wompi-API-Wrapper (server-only)
  server/payment.functions.ts          ← createServerFn (admin-geschützt)

src/routes/
  auth.tsx                             ← Login/Signup
  admin/payments.tsx                   ← Admin-Dashboard (RBAC)
  api/public/wompi-webhook.ts          ← Webhook (Signaturprüfung + Idempotenz)
```

## Datenbank (Lovable Cloud)

- `booking_requests` – alle Anfragen mit Status `pending` / `link_sent` / `paid` / `cancelled`.
  RLS: jeder darf INSERT (öffentliches Formular), nur Admins lesen/ändern.
- `user_roles` + `has_role(uid, role)` – Privilege-Escalation-sicher.
- `wompi_events` – Idempotenz-Log (kein Client-Zugriff).

## Erforderliche Secrets

Im Lovable-Cloud-Backend (Cloud → Settings → Secrets) anlegen, **bevor** der erste Payment-Link generiert wird:

| Secret | Wo zu finden |
|---|---|
| `WOMPI_PRIVATE_KEY` | Wompi-Dashboard → Desarrolladores → Llave privada (`prv_test_…` für Sandbox) |
| `WOMPI_PUBLIC_KEY`  | Wompi-Dashboard → Llave pública (`pub_test_…`) |
| `WOMPI_EVENTS_KEY`  | Wompi-Dashboard → Eventos → Llave de eventos (für Webhook-Signatur) |
| `WOMPI_ENV`         | `sandbox` oder `production` (default `sandbox`) |

## Webhook in Wompi konfigurieren

URL: `https://<dein-published-domain>/api/public/wompi-webhook`
Event: `transaction.updated`

Lokale/Sandbox-Tests: nutze die stable Preview-URL `project--6e397541-b9b9-421b-9736-d04fdb6c3757-dev.lovable.app/api/public/wompi-webhook`.

## Admin-Rolle vergeben

1. Account auf `/auth` erstellen, Email bestätigen, dann einloggen.
2. In Lovable Cloud SQL ausführen:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<deine-user-id>', 'admin');
   ```
   (User-ID findest du in Cloud → Users.)

## Patches an bestehender Site

- `src/lib/whatsapp.ts`: WhatsApp-Vorlagen enthalten jetzt den Zahlungshinweis (`⚠️ IMPORTANTE…`). Neue Funktion `bookingRequestMessage` für angereicherten Lead-Text mit Beträgen + Anfrage-ID.
- `src/components/site/TourCard.tsx` / `TourModal.tsx`: WhatsApp-Buttons öffnen jetzt das `BookingRequestModal` über `useBooking()`. `OriginPicker`-Logik für Touren mit Flügen bleibt erhalten.
- `src/routes/__root.tsx`: `<BookingProvider>` wrappt die App.
- `src/components/site/Footer.tsx`: dezenter „Admin"-Link.

Tour-Datenbank (`src/data/tours.ts`) und alle Kategorien wurden nicht angefasst.

## Sprachen

Aktuell unterstützt der Kundenfluss spanische und englische Nachrichten. Bei anderen aktiven Sprachen (zh, hi, ar, …) wird auf Spanisch zurückgefallen — das `language`-Feld der Anfrage speichert den ISO-Code für spätere Erweiterung.
