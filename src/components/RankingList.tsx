'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface LeaderboardEntry {
  user_id: string
  display_name: string
  total_points: number
  exact_results: number
  correct_winner: number
}

interface MatchInfo {
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  match_time: string
  is_finished: boolean
}

interface HistoryEntry {
  id: string
  predicted_home: number
  predicted_away: number
  points: number | null
  matches: MatchInfo | null
}

interface Props {
  leaderboard: LeaderboardEntry[]
  currentUserId: string
  history: HistoryEntry[]
}

export default function RankingList({ leaderboard, currentUserId, history }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h2 className="font-bold text-lg">🥇 Ranking Global</h2>
      </div>

      <div className="divide-y">
        {leaderboard.map((entry, idx) => {
          const isMe = entry.user_id === currentUserId
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null

          return (
            <div key={entry.user_id}>
              {/* Fila del ranking */}
              <div
                className={`flex items-center gap-3 px-5 py-3 ${
                  isMe ? 'bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors' : 'bg-white'
                }`}
                onClick={() => isMe && setExpanded(prev => !prev)}
              >
                <span className="w-8 text-center font-bold text-sm">
                  {medal ?? `${idx + 1}.`}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {entry.display_name}
                    {isMe && (
                      <span className="text-xs text-blue-500 ml-1">(tú)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    {entry.exact_results} exactos · {entry.correct_winner} ganadores
                  </p>
                </div>
                <Badge className="text-sm px-3 py-1">
                  {entry.total_points} pts
                </Badge>
                {isMe && (
                  <svg
                    className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>

              {/* Panel de historial expandible */}
              {isMe && expanded && (
                <div className="bg-blue-50 border-t border-blue-100 px-5 py-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                    Tu historial de predicciones
                  </p>

                  {history.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Aún no hay partidos finalizados con tus predicciones.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {history.map(p => {
                        const m = p.matches
                        if (!m) return null

                        const date = new Date(m.match_time)
                        const dateStr = date.toLocaleDateString('es-GT', {
                          weekday: 'short', day: 'numeric', month: 'short'
                        })

                        const pointColor =
                          p.points === 3 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          p.points === 1 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-slate-100 text-slate-500 border-slate-200'

                        const pointLabel =
                          p.points === 3 ? '✓ Exacto' :
                          p.points === 1 ? '~ Ganador' :
                          '✗ Fallo'

                        return (
                          <div
                            key={p.id}
                            className="bg-white rounded-xl border border-blue-100 px-4 py-3 flex items-center gap-3"
                          >
                            {/* Fecha */}
                            <div className="text-xs text-slate-400 w-20 shrink-0">{dateStr}</div>

                            {/* Partido */}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-slate-700 truncate">
                                {m.home_team} {m.home_score} - {m.away_score} {m.away_team}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Tu predicción: {p.predicted_home} - {p.predicted_away}
                              </div>
                            </div>

                            {/* Puntos */}
                            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${pointColor}`}>
                              {pointLabel} · {p.points ?? 0} pts
                            </div>
                          </div>
                        )
                      })}

                      {/* Total */}
                      <div className="flex justify-end pt-1">
                        <div className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-3 py-1">
                          Total: {history.reduce((sum, p) => sum + (p.points ?? 0), 0)} pts
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {leaderboard.length === 0 && (
          <p className="text-center text-slate-400 py-8 text-sm">
            Aún no hay predicciones. ¡Sé el primero!
          </p>
        )}
      </div>
    </div>
  )
}
