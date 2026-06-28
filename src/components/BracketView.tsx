'use client'

import { useState, useRef } from 'react'

const FLAGS: Record<string, string> = {
  'Mexico': 'mx', 'México': 'mx',
  'Sudafrica': 'za', 'Sudáfrica': 'za',
  'Corea del Sur': 'kr',
  'Chequia': 'cz',
  'Canada': 'ca', 'Canadá': 'ca',
  'Bosnia-Herzegovina': 'ba',
  'Qatar': 'qa',
  'Suiza': 'ch',
  'Brasil': 'br',
  'Marruecos': 'ma',
  'Haiti': 'ht', 'Haití': 'ht',
  'Escocia': 'gb-sct',
  'EE.UU.': 'us', 'Estados Unidos': 'us',
  'Paraguay': 'py',
  'Australia': 'au',
  'Turquia': 'tr', 'Turquía': 'tr',
  'Alemania': 'de',
  'Curazao': 'cw',
  'Costa de Marfil': 'ci',
  'Ecuador': 'ec',
  'Paises Bajos': 'nl', 'Países Bajos': 'nl',
  'Japon': 'jp', 'Japón': 'jp',
  'Suecia': 'se',
  'Tunez': 'tn', 'Túnez': 'tn',
  'Belgica': 'be', 'Bélgica': 'be',
  'Egipto': 'eg',
  'Iran': 'ir', 'Irán': 'ir',
  'Nueva Zelanda': 'nz',
  'Espana': 'es', 'España': 'es',
  'Cabo Verde': 'cv',
  'Arabia Saudita': 'sa',
  'Uruguay': 'uy',
  'Francia': 'fr',
  'Senegal': 'sn',
  'Irak': 'iq',
  'Noruega': 'no',
  'Argentina': 'ar',
  'Argelia': 'dz',
  'Austria': 'at',
  'Jordania': 'jo',
  'Portugal': 'pt',
  'RD Congo': 'cd',
  'Uzbekistan': 'uz', 'Uzbekistán': 'uz',
  'Colombia': 'co',
  'Inglaterra': 'gb-eng',
  'Croacia': 'hr',
  'Ghana': 'gh',
  'Panama': 'pa', 'Panamá': 'pa',
}

function Flag({ team }: { team: string | null }) {
  if (!team) return <div className="w-5 h-3.5 bg-slate-800 rounded-sm shrink-0" />
  const code = FLAGS[team]
  if (!code) return <div className="w-5 h-3.5 bg-slate-700 rounded-sm shrink-0" />
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={team}
      className="h-3.5 w-5 object-cover rounded-sm shrink-0 ring-1 ring-white/10"
    />
  )
}

type Match = {
  id: string
  home_team: string
  away_team: string
  match_time: string
  home_score: number | null
  away_score: number | null
  is_finished: boolean
  group_name: string
}

type Prediction = {
  predicted_home: number
  predicted_away: number
  points: number | null
}

interface Props {
  matches: Match[]
  predictionMap: Record<string, Prediction>
}

// Estructura fija del cuadro — 8 slots de R16, 4 de R8, 2 de R4, 1 final, 1 tercer puesto
const ROUND_LABELS = ['16vos', '8vos', '4tos', 'Semifinal', 'Final']

function EmptySlot({ label }: { label?: string }) {
  return (
    <div className="w-52 rounded-lg bg-[#0B1120]/60 border border-dashed border-slate-700/60 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-slate-800/60">
        <span className="text-[9px] text-slate-600 font-mono uppercase tracking-wide">{label ?? 'Por definir'}</span>
      </div>
      <div className="divide-y divide-slate-800/60">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="w-5 h-3.5 bg-slate-800 rounded-sm shrink-0" />
          <span className="flex-1 text-xs text-slate-600">Por definir</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="w-5 h-3.5 bg-slate-800 rounded-sm shrink-0" />
          <span className="flex-1 text-xs text-slate-600">Por definir</span>
        </div>
      </div>
    </div>
  )
}

function MatchSlot({ match, prediction }: { match: Match; prediction: Prediction | null }) {
  const date = new Date(match.match_time)
  const dateLabel = date.toLocaleDateString('es-GT', {
    day: 'numeric', month: 'short', timeZone: 'America/Guatemala'
  })

  const homeWon = match.is_finished && (match.home_score ?? 0) > (match.away_score ?? 0)
  const awayWon = match.is_finished && (match.away_score ?? 0) > (match.home_score ?? 0)

  return (
    <div className="w-52 rounded-lg bg-[#111827] border border-slate-800 overflow-hidden shadow-md shadow-black/30 hover:border-emerald-700/50 transition-colors shrink-0">
      <div className="px-3 py-1.5 bg-[#0B1120] border-b border-slate-800 flex justify-between items-center">
        <span className="text-[9px] text-slate-500 font-mono">{dateLabel}</span>
        {match.is_finished ? (
          <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wide">Final</span>
        ) : (
          <span className="text-[9px] font-semibold text-amber-500 uppercase tracking-wide">● Próximo</span>
        )}
      </div>

      <div className="divide-y divide-slate-800">
        <div className={`flex items-center gap-2 px-3 py-2 ${homeWon ? 'bg-emerald-950/40' : ''}`}>
          <Flag team={match.home_team} />
          <span className={`flex-1 text-xs font-semibold truncate ${homeWon ? 'text-emerald-400' : 'text-slate-200'}`}>
            {match.home_team}
          </span>
          <span className={`font-mono text-sm font-bold w-5 text-center ${homeWon ? 'text-emerald-400' : 'text-slate-400'}`}>
            {match.home_score ?? '-'}
          </span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 ${awayWon ? 'bg-emerald-950/40' : ''}`}>
          <Flag team={match.away_team} />
          <span className={`flex-1 text-xs font-semibold truncate ${awayWon ? 'text-emerald-400' : 'text-slate-200'}`}>
            {match.away_team}
          </span>
          <span className={`font-mono text-sm font-bold w-5 text-center ${awayWon ? 'text-emerald-400' : 'text-slate-400'}`}>
            {match.away_score ?? '-'}
          </span>
        </div>
      </div>

      {prediction && (
        <div className="px-3 py-1 bg-[#0B1120] border-t border-slate-800 flex justify-between items-center">
          <span className="text-[9px] text-slate-500 font-mono">{prediction.predicted_home}-{prediction.predicted_away}</span>
          {match.is_finished && (
            <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
              prediction.points === 5 ? 'bg-emerald-500/20 text-emerald-400' :
              prediction.points === 3 ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-700/50 text-slate-500'
            }`}>
              {prediction.points ?? 0}p
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Conector visual entre rondas (líneas tipo bracket)
function Connector({ count }: { count: number }) {
  return (
    <div className="flex flex-col justify-around shrink-0" style={{ width: '24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-1 flex items-center justify-center">
          <div className="w-full h-px bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

function BracketColumn({
  title,
  matches,
  predictionMap,
  emptyCount,
}: {
  title: string
  matches: Match[]
  predictionMap: Record<string, Prediction>
  emptyCount: number
}) {
  return (
    <div className="flex flex-col gap-3 shrink-0">
      <div className="text-center mb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex flex-col justify-around gap-6 flex-1">
        {matches.map(m => (
          <MatchSlot key={m.id} match={m} prediction={predictionMap[m.id] ?? null} />
        ))}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <EmptySlot key={`empty-${i}`} />
        ))}
      </div>
    </div>
  )
}

export default function BracketView({ matches, predictionMap }: Props) {
  const [mode, setMode] = useState<'scroll' | 'zoom'>('scroll')
  const containerRef = useRef<HTMLDivElement>(null)

  if (matches.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 text-sm">Aún no hay partidos de eliminatoria cargados.</p>
      </div>
    )
  }

  // Por ahora solo tenemos partidos de R16, el resto son slots vacíos
  const r16 = matches.filter(m => m.group_name === 'R16')

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-4 flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Mundial 2026</span>
          <h1 className="text-2xl font-black text-white tracking-tight">Cuadro de Eliminatoria</h1>
          <p className="text-sm text-slate-500 mt-0.5">{r16.length} de 16 partidos confirmados</p>
        </div>

        {/* Selector de modo */}
        <div className="flex rounded-lg bg-[#111827] border border-slate-800 p-1">
          <button
            onClick={() => setMode('scroll')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'scroll' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            ↔ Deslizar
          </button>
          <button
            onClick={() => setMode('zoom')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'zoom' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            🔍 Zoom
          </button>
        </div>
      </div>

      {mode === 'scroll' ? (
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-1 items-stretch" style={{ minWidth: 'max-content' }}>
            <BracketColumn title="16vos de Final" matches={r16} predictionMap={predictionMap} emptyCount={Math.max(0, 16 - r16.length)} />
            <Connector count={8} />
            <BracketColumn title="8vos de Final" matches={[]} predictionMap={predictionMap} emptyCount={8} />
            <Connector count={4} />
            <BracketColumn title="4tos de Final" matches={[]} predictionMap={predictionMap} emptyCount={4} />
            <Connector count={2} />
            <BracketColumn title="Semifinal" matches={[]} predictionMap={predictionMap} emptyCount={2} />
            <Connector count={1} />
            <div className="flex flex-col gap-3 shrink-0 justify-center">
              <div className="text-center mb-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">🏆 Final</span>
              </div>
              <EmptySlot label="Final · 19 jul" />
              <div className="mt-4">
                <span className="text-[9px] text-slate-500 uppercase tracking-wide block text-center mb-1">3er Puesto</span>
                <EmptySlot label="3er puesto" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="overflow-auto rounded-xl border border-slate-800 bg-[#0B1120]/40"
          style={{ height: '70vh', touchAction: 'pan-x pan-y pinch-zoom' }}
        >
          <div className="flex gap-1 items-stretch p-6" style={{ minWidth: '1400px' }}>
            <BracketColumn title="16vos de Final" matches={r16} predictionMap={predictionMap} emptyCount={Math.max(0, 16 - r16.length)} />
            <Connector count={8} />
            <BracketColumn title="8vos de Final" matches={[]} predictionMap={predictionMap} emptyCount={8} />
            <Connector count={4} />
            <BracketColumn title="4tos de Final" matches={[]} predictionMap={predictionMap} emptyCount={4} />
            <Connector count={2} />
            <BracketColumn title="Semifinal" matches={[]} predictionMap={predictionMap} emptyCount={2} />
            <Connector count={1} />
            <div className="flex flex-col gap-3 shrink-0 justify-center">
              <div className="text-center mb-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">🏆 Final</span>
              </div>
              <EmptySlot label="Final · 19 jul" />
              <div className="mt-4">
                <span className="text-[9px] text-slate-500 uppercase tracking-wide block text-center mb-1">3er Puesto</span>
                <EmptySlot label="3er puesto" />
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-600 pb-3">Pellizca para hacer zoom · Desliza para mover</p>
        </div>
      )}
    </div>
  )
}
