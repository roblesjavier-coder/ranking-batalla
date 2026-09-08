import type { Metadata } from 'next'
import Link from 'next/link'
import { RANKFEST } from '@/lib/rankfest'
import { RankFestCountdown } from '@/components/RankFestCountdown'

const SITE = 'https://rankingbatalla.com'

export const metadata: Metadata = {
  title: `Rank Fest ${RANKFEST.edition} · Oficial | Ranking Batalla`,
  description: `${RANKFEST.dateLabel} en ${RANKFEST.venue.name}. Juegos chilenos, ping pong, pallas huasas, asado y batalla de rap. ${RANKFEST.slogan}`,
  openGraph: {
    title: `Rank Fest ${RANKFEST.edition} · Oficial`,
    description: `${RANKFEST.dateLabel} · ${RANKFEST.venue.name}, ${RANKFEST.venue.commune}. ${RANKFEST.slogan}`,
    url: `${SITE}/rankfest`,
    siteName: 'Ranking Batalla',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: `${SITE}/rankfest/hero.jpg`,
        width: 1536,
        height: 1024,
        alt: `Rank Fest ${RANKFEST.edition} Oficial`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

const serif = { fontFamily: 'Georgia, "Times New Roman", serif' } as const

const whatsappShare = `https://wa.me/?text=${encodeURIComponent(
  `🔥 RANK FEST ${RANKFEST.edition} OFICIAL 🔥\n${RANKFEST.dateLabel} · ${RANKFEST.venue.name}\nTodo el programa aca: ${SITE}/rankfest`
)}`

export default function RankFestPage() {
  return (
    <div className="min-h-screen bg-[#080807] text-[#eee4cf]" style={serif}>
      {/* Barra superior */}
      <header className="sticky top-0 z-20 bg-[#080807]/95 backdrop-blur border-b border-[#4e4639]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/ranking" className="flex items-center gap-2 font-bold tracking-[0.2em] uppercase text-sm">
            <span className="text-2xl leading-none">☠</span>
            <span className="leading-tight">
              Rank
              <br />
              Batalla
            </span>
          </Link>
          <Link
            href="/ranking"
            className="text-xs uppercase tracking-wider text-[#d8c9aa] hover:text-red-400 transition-colors"
          >
            ← Volver al ranking
          </Link>
        </div>
      </header>

      <main>
        {/* Portada: todo el texto viene dentro de la imagen */}
        <section className="max-w-4xl mx-auto border-b border-[#4e4639]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rankfest/hero.jpg"
            alt={`Rank Fest ${RANKFEST.edition} Oficial — ${RANKFEST.dateLabel} en ${RANKFEST.venue.name}, ${RANKFEST.venue.address}, ${RANKFEST.venue.commune}`}
            className="w-full h-auto block"
            fetchPriority="high"
          />
        </section>

        {/* Cuenta regresiva */}
        <section className="max-w-4xl mx-auto px-4 py-10 text-center border-b border-[#4e4639]">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9c9588] mb-4">
            Faltan para la batalla
          </p>
          <RankFestCountdown startsAt={RANKFEST.startsAt} endsAt={RANKFEST.endsAt} variant="full" />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={RANKFEST.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#8d1717] hover:bg-[#bd2929] border border-[#bd2929] text-white uppercase font-bold tracking-wider text-sm transition-colors"
            >
              📍 Como llegar
            </a>
            <a
              href={whatsappShare}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-transparent hover:bg-[#12110f] border border-[#4e4639] text-[#d8c9aa] uppercase font-bold tracking-wider text-sm transition-colors"
            >
              Compartir por WhatsApp
            </a>
          </div>
        </section>

        {/* Presentacion + info */}
        <section className="max-w-4xl mx-auto px-4 py-14">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl uppercase tracking-[0.15em] font-bold">
              Un dia. Una fiesta. Una leyenda.
            </h2>
            <div className="w-24 h-[3px] bg-[#bd2929] mx-auto my-4" />
            <p className="text-[#9c9588] text-base sm:text-lg leading-relaxed">{RANKFEST.intro}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
            <InfoCard icon="📅" label="Fecha" value={RANKFEST.dateLabel} sub={RANKFEST.timeLabel} />
            <InfoCard icon="📍" label="Lugar" value={RANKFEST.venue.name} sub={RANKFEST.venue.commune} />
            <InfoCard icon="⚔️" label="Guerreros" value={RANKFEST.warriors} />
            <InfoCard icon="☠️" label="Mision" value="Competir" sub="Hacer historia" />
          </div>
        </section>

        {/* Actividades */}
        <section className="bg-[#0f0e0c] border-y border-[#4e4639]">
          <div className="max-w-4xl mx-auto px-4 py-14">
            <SectionTitle title="Actividades" subtitle="Cinco pruebas. Una jornada. Un solo espiritu." />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {RANKFEST.activities.map((a, i) => (
                <div
                  key={a.name}
                  className={`bg-[#12110f] border border-[#4e4639] hover:border-[#bd2929] transition-colors p-5 text-center ${
                    i === RANKFEST.activities.length - 1 ? 'col-span-2 md:col-span-1' : ''
                  }`}
                >
                  <div className="text-4xl mb-3">{a.icon}</div>
                  <h3 className="uppercase font-bold text-sm tracking-wider mb-2">{a.name}</h3>
                  <p className="text-[#9c9588] text-sm leading-snug">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cronograma */}
        <section className="max-w-4xl mx-auto px-4 py-14">
          <SectionTitle title="Cronograma" subtitle="El orden oficial de la batalla" />
          <ol className="bg-[#12110f] border border-[#4e4639] divide-y divide-[#4e4639]">
            {RANKFEST.schedule.map((s) => (
              <li key={s.time} className="px-4 py-4 flex gap-4 items-start">
                <span className="text-[#bd2929] font-bold whitespace-nowrap tabular-nums text-sm sm:text-base w-[7.5rem] sm:w-36 shrink-0">
                  🕒 {s.time}
                </span>
                <div className="min-w-0">
                  <div className="uppercase font-bold tracking-wider text-sm sm:text-base">{s.name}</div>
                  <div className="text-[#9c9588] text-sm">{s.description}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Ubicacion */}
        <section className="bg-[#0f0e0c] border-y border-[#4e4639]">
          <div className="max-w-4xl mx-auto px-4 py-14 text-center">
            <SectionTitle title={RANKFEST.venue.name} />
            <div className="text-2xl">{RANKFEST.venue.address}</div>
            <div className="text-[#9c9588] mt-1">{RANKFEST.venue.commune}</div>
            <a
              href={RANKFEST.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-6 py-3 bg-[#8d1717] hover:bg-[#bd2929] border border-[#bd2929] text-white uppercase font-bold tracking-wider text-sm transition-colors"
            >
              Ver ubicacion
            </a>
          </div>
        </section>
      </main>

      <footer className="px-4 py-12 text-center border-t border-[#4e4639]">
        <div className="text-3xl font-bold tracking-[0.3em] uppercase">☠ Rank Batalla</div>
        <div className="mt-4 text-[#d8c9aa] uppercase tracking-[0.25em] text-sm">{RANKFEST.slogan}</div>
        <div className="mt-8 text-[#666] text-xs">
          © {RANKFEST.edition} Rank Batalla — Rank Fest Oficial ·{' '}
          <Link href="/ranking" className="underline hover:text-[#d8c9aa]">
            Ver ranking
          </Link>
        </div>
      </footer>
    </div>
  )
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-3xl sm:text-4xl uppercase tracking-[0.2em] font-bold">{title}</h2>
      <div className="w-24 h-[3px] bg-[#bd2929] mx-auto my-4" />
      {subtitle && <p className="text-[#9c9588]">{subtitle}</p>}
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-[#12110f] border border-[#4e4639] hover:border-[#bd2929] transition-colors p-5 text-center flex flex-col items-center justify-center min-h-[150px]">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-[#bd2929] text-xs uppercase tracking-[0.2em]">{label}</h3>
      <strong className="mt-2 text-lg leading-tight">{value}</strong>
      {sub && <span className="text-[#9c9588] text-sm mt-1">{sub}</span>}
    </div>
  )
}
