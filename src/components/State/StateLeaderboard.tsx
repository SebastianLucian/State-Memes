import type { StateSummary } from '../../services/types'
import { formatCompact } from '../../lib/format'

export function StateLeaderboard({ summary, highlight }: { summary: StateSummary; highlight?: string }) {
  const rows = summary.tokens.slice(0, 5)
  const total = summary.totalMarketCap || 1
  return (
    <ol className="flex flex-col">
      {rows.map((t, i) => {
        const share = t.marketCap / total
        return (
          <li
            key={t.id}
            className={`relative flex items-center gap-3 py-[7px] ${i > 0 ? 'border-t border-dotted border-ink/20' : ''}`}
          >
            <span className="numeric w-4 text-[10px] text-ink/40">{String(i + 1).padStart(2, '0')}</span>
            <span className="h-2 w-2 shrink-0 rotate-45" style={{ background: t.color }} />
            <span
              className={`numeric flex-1 text-[13px] tracking-[0.02em] ${t.id === highlight ? 'font-semibold text-ink' : 'text-ink/85'}`}
            >
              ${t.symbol}
            </span>
            <span className="relative hidden h-px w-14 bg-ink/15 sm:block" aria-hidden>
              <span className="absolute inset-y-0 left-0 bg-ink/60" style={{ width: `${Math.max(4, share * 100)}%` }} />
            </span>
            <span className="numeric w-16 text-right text-[12.5px] text-ink">{formatCompact(t.marketCap)}</span>
          </li>
        )
      })}
      {summary.tokens.length > rows.length && (
        <li className="label pt-2 text-[9px] text-ink/45">+ {summary.tokens.length - rows.length} more</li>
      )}
    </ol>
  )
}
