'use client'

import { useState } from 'react'
import MatchCard from '@/components/MatchCard'

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
  id?: string
  predicted_home: number
  predicted_away: number
  points?: number
}

interface Props {
  matches: Match[]
  predictionMap: Record<string, Prediction>
  userId: string
}

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  A: { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-400' },
  B: { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400' },
  C: { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  D: { bg: 'bg-lime-50',    border: 'border-lime-200',   text: 'text-lime-700',   dot: 'bg-lime-500' },
  E: { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-500' },
  F: { bg: 'bg-teal-50',    border: 'border-teal-200',   text: 'text-teal-700',   dot: 'bg-teal-500' },
  G: { bg: 'bg-cyan-50',    border: 'border-cyan-200',   text: 'text-cyan-700',   dot: 'bg-cyan-500' },
  H: { bg: 'bg-sky-50',     border: 'border-sky-200',    text: 'text-sky-700',    dot: 'bg-sky-500' },
  I: { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  J: { bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  K: { bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  L: { bg: 'bg-pink-50',    border: 'border-pink-200',   text: 'text-pink-700',   dot: 'bg-pink-500' },
}

const GROUPS_ORDER = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function MatchesAccordion({ matches, predictionMap, userId }: Props) {
  // Agrupar partidos por group_name
  const grouped = matches.reduce((acc, match) => {
    const g = match.group_name ?? 'Sin grupo'
    if (!acc[g]) acc[g] = []
    acc[g].push(match)
    return acc
  }, {} as Record<string, Match[]>)

  const groupKeys = GROUPS_ORDER.filter(g => grouped[g])

  // Por defecto abrir el primer grupo que tenga partidos pendientes
  const firstPending = groupKeys.find(g =>
    grouped[g].some(m => !m.is_finished)
  ) ?? groupKeys[0]

  const [openGroup, setOpenGroup] = useState<string | null>(firstPending ?? null)

  const toggle = (g: string) => setOpenGroup(prev => prev === g ? null : g)

  return (
    <div className="space-y-2">
      {groupKeys.map(g => {
        const groupMatches = grouped[g]
        const colors = GROUP_COLORS[g] ?? { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' }
        const isOpen = openGroup === g

        const total = groupMatches.length
        const finished = groupMatches.filter(m => m.is_finished).length
        const pending = total - finished

        // Cuántas predicciones tiene el usuario en este grupo
        const predicted = groupMatches.filter(m => predictionMap[m.id]).length

        return (
          <div
            key={g}
            className={`rounded-xl border overflow-hidden transition-all ${colors.border}`}
          >
            {/* Header del acordeón */}
            <button
              onClick={() => toggle(g)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                isOpen ? colors.bg : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {g}
                </div>
                <span className="font-semibold text-slate-800 text-sm">
                  Grupo {g}
                </span>

                {/* Badges de estado */}
                <div className="flex items-center gap-1.5">
                  {pending > 0 && (
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                      {pending} pendiente{pending > 1 ? 's' : ''}
                    </span>
                  )}
                  {finished === total && total > 0 && (
                    <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
                      ✓ Completado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Progreso de predicciones */}
                <span className="text-xs text-slate-400 hidden sm:block">
                  {predicted}/{total} predicciones
                </span>

                {/* Barra de progreso */}
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className={`h-full rounded-full transition-all ${colors.dot}`}
                    style={{ width: `${total > 0 ? (finished / total) * 100 : 0}%` }}
                  />
                </div>

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Contenido del acordeón */}
            {isOpen && (
              <div className={`border-t ${colors.border} ${colors.bg} p-3 space-y-3`}>
                {groupMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictionMap[match.id] ?? null}
                    userId={userId}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
