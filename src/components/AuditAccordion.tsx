'use client'

import { useState } from 'react'

type Prediction = {
  predicted_home: number
  predicted_away: number
  points: number | null
  is_auto: boolean
  profiles: { display_name: string } | null
}

type Match = {
  id: string
  home_team: string
  away_team: string
  match_time: string
  home_score: number | null
  away_score: number | null
  group_name: string
  predictions: Prediction[]
}

interface Props {
  matches: Match[]
}

export default function AuditAccordion({ matches }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (matches.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">No hay partidos finalizados aún.</p>
  }

  return (
    <div className="space-y-2">
      {matches.map(match => {
        const isOpen = openId === match.id
        const date = new Date(match.match_time).toLocaleDateString('es-GT', {
          weekday: 'short', day: 'numeric', month: 'short',
          timeZone: 'America/Guatemala'
        })
        const predictions = (match.predictions ?? []).sort((a, b) => (b.points ?? 0) - (a.points ?? 0))

        return (
          <div key={match.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <button
              onClick={() => setOpenId(isOpen ? null : match.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="text-xs text-slate-400 mb-0.5">{date} · {match.group_name}</div>
                <div className="font-semibold text-sm text-slate-800">
                  {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
                </div>
              </div>
              <div className="text-xs text-slate-400 shrink-0">
                {predictions.length} predicciones
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Contenido */}
            {isOpen && (
              <div className="border-t divide-y">
                {predictions.map((p, i) => {
                  const name = p.profiles?.display_name ?? 'Sin nombre'
                  const ptColor =
                    p.points === 5 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    p.points === 3 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-500 border-slate-200'

                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-xs text-slate-400 w-5 shrink-0">{i + 1}.</span>
                      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                        {name}
                        {p.is_auto && <span className="text-xs text-slate-400 ml-1">(auto)</span>}
                      </span>
                      <span className="text-xs text-slate-500 shrink-0">
                        {p.predicted_home} - {p.predicted_away}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${ptColor}`}>
                        {p.points ?? 0} pts
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
