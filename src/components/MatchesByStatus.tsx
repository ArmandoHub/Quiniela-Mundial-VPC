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

function getStatus(match: Match): 'live' | 'upcoming' | 'finished' {
  if (match.is_finished) return 'finished'
  const matchTime = new Date(match.match_time)
  const now = new Date()
  const lockTime = new Date(matchTime.getTime() - 15 * 60 * 1000)
  if (now >= lockTime) return 'live'
  return 'upcoming'
}

function timeUntil(match_time: string): string {
  const diff = new Date(match_time).getTime() - Date.now()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `en ${days}d ${hours}h`
  if (hours > 0) return `en ${hours}h ${mins}m`
  return `en ${mins}m`
}

function groupByDate(matches: Match[]): Record<string, Match[]> {
  return matches.reduce((acc, m) => {
    const date = new Date(m.match_time).toLocaleDateString('es-GT', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(m)
    return acc
  }, {} as Record<string, Match[]>)
}

export default function MatchesByStatus({ matches, predictionMap, userId }: Props) {
  const [finishedOpen, setFinishedOpen] = useState(false)

  const live = matches.filter(m => getStatus(m) === 'live')
  const upcoming = matches.filter(m => getStatus(m) === 'upcoming')
  const finished = matches.filter(m => getStatus(m) === 'finished')

  const upcomingByDate = groupByDate(upcoming)
  const finishedByDate = groupByDate([...finished].reverse())

  return (
    <div className="space-y-6">

      {/* EN JUEGO */}
      {live.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <h2 className="font-bold text-sm text-red-600 uppercase tracking-wide">En juego</h2>
            <span className="text-xs bg-red-100 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-medium">
              {live.length}
            </span>
          </div>
          <div className="space-y-3">
            {live.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictionMap[match.id] ?? null}
                userId={userId}
              />
            ))}
          </div>
        </section>
      )}

      {/* PRÓXIMOS */}
      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
            <h2 className="font-bold text-sm text-emerald-700 uppercase tracking-wide">Próximos</h2>
            <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
              {upcoming.length}
            </span>
          </div>
          <div className="space-y-4">
            {Object.entries(upcomingByDate).map(([date, dayMatches]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                  {date}
                </p>
                <div className="space-y-3">
                  {dayMatches.map(match => (
                    <div key={match.id} className="relative">
                      {/* Badge de tiempo restante */}
                      <div className="absolute -top-2 right-3 z-10">
                        <span className="text-[10px] font-semibold bg-emerald-600 text-white rounded-full px-2 py-0.5">
                          {timeUntil(match.match_time)}
                        </span>
                      </div>
                      <MatchCard
                        match={match}
                        prediction={predictionMap[match.id] ?? null}
                        userId={userId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FINALIZADOS */}
      {finished.length > 0 && (
        <section>
          <button
            onClick={() => setFinishedOpen(prev => !prev)}
            className="w-full flex items-center gap-2 mb-3 group"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-slate-400"></div>
            <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide">Finalizados</h2>
            <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5 font-medium">
              {finished.length}
            </span>
            <svg
              className={`w-4 h-4 text-slate-400 ml-auto transition-transform duration-200 ${finishedOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {finishedOpen && (
            <div className="space-y-4">
              {Object.entries(finishedByDate).map(([date, dayMatches]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                    {date}
                  </p>
                  <div className="space-y-3">
                    {dayMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        prediction={predictionMap[match.id] ?? null}
                        userId={userId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {matches.length === 0 && (
        <p className="text-center text-slate-400 py-12 text-sm">No hay partidos disponibles.</p>
      )}
    </div>
  )
}
