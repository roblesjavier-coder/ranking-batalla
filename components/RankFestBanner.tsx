import Link from 'next/link'
import { RANKFEST, isRankFestUpcoming } from '@/lib/rankfest'
import { RankFestCountdown } from './RankFestCountdown'

/**
 * Banner del Rank Fest para la parte alta de /ranking.
 * Se muestra solo hasta que termine el evento (ver RANKFEST.endsAt).
 */
export function RankFestBanner() {
  if (!isRankFestUpcoming()) return null

  return (
    <Link
      href="/rankfest"
      className="block relative overflow-hidden rounded-2xl shadow-md mb-5 group border border-red-950/60"
      style={{
        backgroundImage: 'url(/rankfest/banner-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40" />

      <div className="relative px-4 py-4 text-amber-50">
        <div className="text-[10px] uppercase tracking-[0.3em] text-red-400 mb-1">
          {RANKFEST.banner.kicker} · {RANKFEST.dateLabel}
        </div>
        <div className="flex items-baseline gap-2 leading-none">
          <span
            className="text-3xl font-black tracking-wider uppercase text-[#eee4cf]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Rank
          </span>
          <span
            className="text-3xl font-black italic tracking-wider uppercase text-red-500"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Fest
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-200/80 ml-1">
            {RANKFEST.subtitle}
          </span>
        </div>
        <div className="text-xs text-amber-100/80 mt-1">
          📍 {RANKFEST.venue.name} · {RANKFEST.venue.commune}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3 flex-wrap">
          <RankFestCountdown
            startsAt={RANKFEST.startsAt}
            endsAt={RANKFEST.endsAt}
            variant="compact"
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-red-300 group-hover:text-red-200 whitespace-nowrap">
            {RANKFEST.banner.cta}
          </span>
        </div>
      </div>
    </Link>
  )
}
