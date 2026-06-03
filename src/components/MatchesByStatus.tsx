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

interface SectionHeaderProps {
  color: string
  dotClass: string
  label: string
  count: number
  isOpen: boolean
  onToggle: () => void
  live?: boolean
}

function SectionHeader({ color, dotClass, label, count, isOpen, onToggle, live }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 mb-3"
    >
      {live ? (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
      ) : (
        <div className={`h-2.5 w-2.5 rounded-full ${dotClass}`}></div>
      )}
      <h2 className={`font-bold text-sm uppercase tracking-wide ${color}`}>{label}</h2>
      <span className={`text-xs rounded-full px-2 py-0.5 font-medium border ${
        live ? 'bg-red-100 text-red-600 border-red-200' :
        label === 'PRÓXIMOS' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
        'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        {count}
      </span>
      <svg
        className={`w-4 h-4 text-slate-400 ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export default function MatchesByStatus({ matches, predictionMap, userId }: Props) {
  const safeMatches = matches ?? []
  const live = safeMatches.filter(m => getStatus(m) === 'live')
  const upcoming = safeMatches.filter(m => getStatus(m) === 'upcoming')
  const finished = safeMatches.filter(m => getStatus(m) === 'finished')

  const [liveOpen, setLiveOpen] = useState(true)
  const [upcomingOpen, setUpcomingOpen] = useState(true)   // abierto por defecto
  const [finishedOpen, setFinishedOpen] = useState(false)  // cerrado por defecto

  const upcomingByDate = groupByDate(upcoming)
  const finishedByDate = groupByDate([...finished].reverse())

  return (
    <div className="space-y-6">

      {/* EN JUEGO */}
      {live.length > 0 && (
        <section>
          <SectionHeader
            live
            color="text-red-600"
            dotClass="bg-red-500"
            label="EN JUEGO"
            count={live.length}
            isOpen={liveOpen}
            onToggle={() => setLiveOpen(prev => !prev)}
          />
          {liveOpen && (
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
          )}
        </section>
      )}

      {/* PRÓXIMOS */}
      {upcoming.length > 0 && (
        <section>
          <SectionHeader
            color="text-emerald-700"
            dotClass="bg-emerald-500"
            label="PRÓXIMOS"
            count={upcoming.length}
            isOpen={upcomingOpen}
            onToggle={() => setUpcomingOpen(prev => !prev)}
          />
          {upcomingOpen && (
            <div className="space-y-4">
              {Object.entries(upcomingByDate).map(([date, dayMatches]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                    {date}
                  </p>
                  <div className="space-y-3">
                    {dayMatches.map(match => (
                      <div key={match.id} className="relative">
                        <div className="absolute -top-2 right-3 z-0">
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
          )}
        </section>
      )}

      {/* FINALIZADOS */}
      {finished.length > 0 && (
        <section>
          <SectionHeader
            color="text-slate-500"
            dotClass="bg-slate-400"
            label="FINALIZADOS"
            count={finished.length}
            isOpen={finishedOpen}
            onToggle={() => setFinishedOpen(prev => !prev)}
          />
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

      {safeMatches.length === 0 && (
        <p className="text-center text-slate-400 py-12 text-sm">No hay partidos disponibles.</p>
      )}
    </div>
  )
}
