'use client'

import { useState } from 'react'

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

function Flag({ team, size = 'md' }: { team: string | null; size?: 'md' | 'sm' }) {
  const cls = size === 'md' ? 'h-4 w-6' : 'h-3 w-4'
  if (!team) return <div className={`${cls} bg-slate-800 rounded-sm shrink-0`} />
  const code = FLAGS[team]
  if (!code) return <div className={`${cls} bg-slate-700 rounded-sm shrink-0`} />
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={team}
      className={`${cls} object-cover rounded-sm shrink-0 ring-1 ring-white/10`}
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

const ROUNDS = [
  { key: 'R16', label: '16vos', full: '16vos de Final', count: 16 },
  { key: 'R8', label: '8vos', full: '8vos de Final', count: 8 },
  { key: 'QF', label: '4tos', full: 'Cuartos de Final', count: 4 },
  { key: 'SF', label: 'Semis', full: 'Semifinales', count: 2 },
  { key: 'F', label: 'Final', full: 'Gran Final', count: 1 },
]

/* ---------- VISTA POR PESTAÑAS (principal) ---------- */

function EmptyMatchCard() {
  return (
    <div className="rounded-xl bg-[#0B1120]/60 border border-dashed border-slate-700/60 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800/60">
        <span className="text-[10px] text-slate-600 font-mono uppercase tracking-wide">Por definir</span>
      </div>
      <div className="divide-y divide-slate-800/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-6 h-4 bg-slate-800 rounded-sm shrink-0" />
          <span className="flex-1 text-sm text-slate-600">Equipo por confirmar</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-6 h-4 bg-slate-800 rounded-sm shrink-0" />
          <span className="flex-1 text-sm text-slate-600">Equipo por confirmar</span>
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, prediction }: { match: Match; prediction: Prediction | null }) {
  const date = new Date(match.match_time)
  const dateLabel = date.toLocaleDateString('es-GT', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Guatemala'
  })
  const timeLabel = date.toLocaleTimeString('es-GT', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala'
  })

  const homeWon = match.is_finished && (match.home_score ?? 0) > (match.away_score ?? 0)
  const awayWon = match.is_finished && (match.away_score ?? 0) > (match.home_score ?? 0)

  return (
    <div className="rounded-xl bg-[#111827] border border-slate-800 overflow-hidden shadow-lg shadow-black/30">
      <div className="px-4 py-2 bg-[#0B1120] border-b border-slate-800 flex justify-between items-center">
        <span className="text-[11px] text-slate-500 font-mono">{dateLabel} · {timeLabel}</span>
        {match.is_finished ? (
          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Finalizado</span>
        ) : (
          <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">● Próximo</span>
        )}
      </div>

      <div className="divide-y divide-slate-800">
        <div className={`flex items-center gap-3 px-4 py-3 ${homeWon ? 'bg-emerald-950/40' : ''}`}>
          <Flag team={match.home_team} />
          <span className={`flex-1 text-base font-semibold truncate ${homeWon ? 'text-emerald-400' : 'text-slate-200'}`}>
            {match.home_team}
          </span>
          <span className={`font-mono text-xl font-bold w-7 text-center ${homeWon ? 'text-emerald-400' : 'text-slate-400'}`}>
            {match.home_score ?? '-'}
          </span>
        </div>
        <div className={`flex items-center gap-3 px-4 py-3 ${awayWon ? 'bg-emerald-950/40' : ''}`}>
          <Flag team={match.away_team} />
          <span className={`flex-1 text-base font-semibold truncate ${awayWon ? 'text-emerald-400' : 'text-slate-200'}`}>
            {match.away_team}
          </span>
          <span className={`font-mono text-xl font-bold w-7 text-center ${awayWon ? 'text-emerald-400' : 'text-slate-400'}`}>
            {match.away_score ?? '-'}
          </span>
        </div>
      </div>

      {prediction && (
        <div className="px-4 py-2 bg-[#0B1120] border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Tu apuesta: <span className="font-mono text-slate-300">{prediction.predicted_home}-{prediction.predicted_away}</span>
          </span>
          {match.is_finished && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              prediction.points === 5 ? 'bg-emerald-500/20 text-emerald-400' :
              prediction.points === 3 ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-700/50 text-slate-500'
            }`}>
              {prediction.points ?? 0} pts
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- VISTA DE MAPA COMPLETO (secundaria, modal) ---------- */

function MiniMatchCard({ match }: { match: Match }) {
  const homeWon = match.is_finished && (match.home_score ?? 0) > (match.away_score ?? 0)
  const awayWon = match.is_finished && (match.away_score ?? 0) > (match.home_score ?? 0)

  return (
    <div className="w-44 rounded-md bg-[#111827] border border-slate-800 overflow-hidden shrink-0">
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${homeWon ? 'bg-emerald-950/40' : ''}`}>
        <Flag team={match.home_team} size="sm" />
        <span className={`flex-1 text-[11px] font-semibold truncate ${homeWon ? 'text-emerald-400' : 'text-slate-200'}`}>
          {match.home_team}
        </span>
        <span className={`font-mono text-xs font-bold w-4 text-center ${homeWon ? 'text-emerald-400' : 'text-slate-500'}`}>
          {match.home_score ?? '-'}
        </span>
      </div>
      <div className="h-px bg-slate-800" />
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${awayWon ? 'bg-emerald-950/40' : ''}`}>
        <Flag team={match.away_team} size="sm" />
        <span className={`flex-1 text-[11px] font-semibold truncate ${awayWon ? 'text-emerald-400' : 'text-slate-200'}`}>
          {match.away_team}
        </span>
        <span className={`font-mono text-xs font-bold w-4 text-center ${awayWon ? 'text-emerald-400' : 'text-slate-500'}`}>
          {match.away_score ?? '-'}
        </span>
      </div>
    </div>
  )
}

function MiniEmptySlot() {
  return (
    <div className="w-44 rounded-md bg-[#0B1120]/60 border border-dashed border-slate-700/60 overflow-hidden shrink-0">
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <div className="w-4 h-3 bg-slate-800 rounded-sm shrink-0" />
        <span className="flex-1 text-[11px] text-slate-600">Por definir</span>
      </div>
      <div className="h-px bg-slate-800/60" />
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <div className="w-4 h-3 bg-slate-800 rounded-sm shrink-0" />
        <span className="flex-1 text-[11px] text-slate-600">Por definir</span>
      </div>
    </div>
  )
}

function MiniColumn({ matches, emptyCount }: { matches: Match[]; emptyCount: number }) {
  return (
    <div className="flex flex-col justify-around gap-5 shrink-0">
      {matches.map(m => <MiniMatchCard key={m.id} match={m} />)}
      {Array.from({ length: emptyCount }).map((_, i) => <MiniEmptySlot key={i} />)}
    </div>
  )
}

function Connector({ count }: { count: number }) {
  return (
    <div className="flex flex-col justify-around shrink-0" style={{ width: '18px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-1 flex items-center justify-center">
          <div className="w-full h-px bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

function FullBracketModal({
  roundsWithMatches,
  onClose,
}: {
  roundsWithMatches: { key: string; full: string; count: number; matches: Match[] }[]
  onClose: () => void
}) {
  const get = (key: string) => roundsWithMatches.find(r => r.key === key)!

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0B1120]">
        <div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Mapa completo</span>
          <h2 className="text-base font-bold text-white">Cuadro de Eliminatoria</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
        >
          ✕
        </button>
      </div>

      <div
        className="flex-1 overflow-auto bg-[#0B1120]"
        style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
      >
        <div className="flex gap-1 items-stretch p-5" style={{ minWidth: '1300px', minHeight: '100%' }}>
          <MiniColumn matches={get('R16').matches} emptyCount={Math.max(0, 16 - get('R16').matches.length)} />
          <Connector count={8} />
          <MiniColumn matches={get('R8').matches} emptyCount={Math.max(0, 8 - get('R8').matches.length)} />
          <Connector count={4} />
          <MiniColumn matches={get('QF').matches} emptyCount={Math.max(0, 4 - get('QF').matches.length)} />
          <Connector count={2} />
          <MiniColumn matches={get('SF').matches} emptyCount={Math.max(0, 2 - get('SF').matches.length)} />
          <Connector count={1} />
          <div className="flex flex-col gap-4 shrink-0 justify-center">
            <div>
              <span className="text-[9px] text-amber-400 uppercase tracking-wide block text-center mb-1">🏆 Final</span>
              {get('F').matches.length > 0 ? <MiniMatchCard match={get('F').matches[0]} /> : <MiniEmptySlot />}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 text-center bg-[#0B1120] border-t border-slate-800">
        <p className="text-[10px] text-slate-500">Pellizca para hacer zoom · Desliza para mover</p>
      </div>
    </div>
  )
}

/* ---------- COMPONENTE PRINCIPAL ---------- */

export default function BracketView({ matches, predictionMap }: Props) {
  const [activeRound, setActiveRound] = useState('R16')
  const [showFullMap, setShowFullMap] = useState(false)

  const roundsWithMatches = ROUNDS.map(r => ({
    ...r,
    matches: matches.filter(m => m.group_name === r.key),
  }))

  const current = roundsWithMatches.find(r => r.key === activeRound)!
  const emptyCount = Math.max(0, current.count - current.matches.length)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Mundial 2026</span>
          <h1 className="text-2xl font-black text-white tracking-tight">Cuadro de Eliminatoria</h1>
          <p className="text-sm text-slate-500 mt-0.5">Eliminación directa hasta la final</p>
        </div>
        <button
          onClick={() => setShowFullMap(true)}
          className="shrink-0 mt-1 px-3 py-2 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 hover:border-emerald-700/50"
        >
          🗺️ Mapa
        </button>
      </div>

      {/* Tabs de rondas */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
        {roundsWithMatches.map(r => {
          const isActive = r.key === activeRound
          return (
            <button
              key={r.key}
              onClick={() => setActiveRound(r.key)}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#111827] text-slate-400 border border-slate-800'
              }`}
            >
              {r.key === 'F' && '🏆 '}
              {r.label}
              <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-200' : 'text-slate-600'}`}>
                {r.matches.length}/{r.count}
              </span>
            </button>
          )
        })}
      </div>

      <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">
        {current.full}
      </h2>

      <div className="space-y-3">
        {current.matches.map(m => (
          <MatchCard key={m.id} match={m} prediction={predictionMap[m.id] ?? null} />
        ))}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <EmptyMatchCard key={`empty-${i}`} />
        ))}
      </div>

      {current.matches.length === 0 && (
        <p className="text-center text-slate-500 text-sm mt-6">
          Esta ronda todavía no comienza. Vuelve cuando se definan los cruces.
        </p>
      )}

      {showFullMap && (
        <FullBracketModal
          roundsWithMatches={roundsWithMatches}
          onClose={() => setShowFullMap(false)}
        />
      )}
    </div>
  )
}
