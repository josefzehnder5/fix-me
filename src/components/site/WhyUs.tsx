import { motion } from "framer-motion";

const ITEMS = [
  { icon: "🏆", title: "Operador local", text: "No intermediarios. Conocemos cada ranchería y cada camino del desierto." },
  { icon: "🤝", title: "Comunidad Wayuu", text: "Trabajamos directamente con familias indígenas. Tu viaje genera impacto real." },
  { icon: "🚐", title: "Transporte 4x4 propio", text: "Camperos con A/C y conductor wayuu experimentado. Seguridad ante todo." },
  { icon: "💬", title: "Atención humana 24/7", text: "WhatsApp con respuesta en minutos. Una persona real, no un bot." },
];

export function WhyUs() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="small-caps text-[color:var(--color-terracotta)]">Por qué Castle Tours</p>
          <h2 className="mt-2 font-display text-4xl text-balance md:text-5xl">No vendemos tours. Cuidamos viajes.</h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-3xl border border-[color:var(--color-border)] bg-white p-6"
            >
              <div className="text-4xl">{it.icon}</div>
              <h3 className="mt-4 font-display text-xl">{it.title}</h3>
              <p className="mt-2 text-sm text-pretty text-[color:var(--color-muted-foreground)]">{it.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
