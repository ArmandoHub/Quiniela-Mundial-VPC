'use client'

import { useState } from 'react'

type Prediction = {
  predicted_home: number
  predicted_away: number
  points: number | null
  is_auto: boolean
  profiles: { display_name: string } | null
  user_id: string
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

export default function AuditMatrix({ matches }: Props) {
  const [tooltip, setTooltip] = useState<{ uid: string; name: string } | null>(null)

  if (matches.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">No hay partidos finalizados aún.</p>
  }

  // Obtener usuarios únicos
  const usersMap: Record<string, string> = {}
  matches.forEach(m => {
    m.predictions.forEach(p => {
      const name = Array.isArray(p.profiles)
        ? p.profiles[0]?.display_name
        : p.profiles?.display_name
      if (p.user_id && name) {
        usersMap[p.user_id] = name
      }
    })
  })

  const users = Object.entries(usersMap).sort((a, b) => a[1].localeCompare(b[1]))

  // Iniciales del nombre
  function getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
  }

  // Totales por usuario
  const totals: Record<string, number> = {}
  users.forEach(([uid]) => { totals[uid] = 0 })
  matches.forEach(m => {
    m.predictions.forEach(p => {
      if (totals[p.user_id] !== undefined) {
        totals[p.user_id] += p.points ?? 0
      }
    })
  })

  return (
    <div className="relative">
      {/* Tooltip de nombre completo */}
      {tooltip && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
          {tooltip.name}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
        <table className="text-xs border-collapse min-w-full">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="sticky left-0 z-20 bg-slate-900 px-3 py-2 text-left font-semibold whitespace-nowrap border-r border-slate-700 min-w-[140px]">
                Partido
              </th>
              <th className="px-3 py-2 text-center font-semibold whitespace-nowrap border-r border-slate-700 min-w-[55px]">
                Res.
              </th>
              {users.map(([uid, name]) => (
                <th
                  key={uid}
                  className="px-2 py-2 text-center font-medium border-r border-slate-700 min-w-[44px] cursor-pointer select-none"
                  onClick={() => setTooltip(tooltip?.uid === uid ? null : { uid, name })}
                >
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold mx-auto">
                    {getInitials(name)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {matches.map((match, idx) => {
              const predByUser: Record<string, Prediction> = {}
              match.predictions.forEach(p => { predByUser[p.user_id] = p })

              return (
                <tr key={match.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {/* Partido */}
                  <td className={`sticky left-0 z-10 px-3 py-2 font-medium text-slate-700 border-r border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <div className="text-[10px] text-slate-400 mb-0.5">{match.group_name}</div>
                    <div className="whitespace-nowrap">{match.home_team} vs {match.away_team}</div>
                  </td>

                  {/* Resultado */}
                  <td className="px-2 py-2 text-center font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                    {match.home_score}-{match.away_score}
                  </td>

                  {/* Predicción por usuario */}
                  {users.map(([uid]) => {
                    const pred = predByUser[uid]
                    if (!pred) {
                      return (
                        <td key={uid} className="px-1 py-2 text-center text-slate-300 border-r border-slate-100">
                          -
                        </td>
                      )
                    }

                    const pts = pred.points ?? 0
                    const cellBg =
                      pts === 5 ? 'bg-emerald-100' :
                      pts === 3 ? 'bg-amber-100' :
                      ''
                    const textColor =
                      pts === 5 ? 'text-emerald-700' :
                      pts === 3 ? 'text-amber-700' :
                      pred.is_auto ? 'text-slate-300' : 'text-slate-500'

                    return (
                      <td key={uid} className={`px-1 py-2 text-center border-r border-slate-100 ${cellBg}`}>
                        <div className={`font-medium ${textColor}`}>{pred.predicted_home}-{pred.predicted_away}</div>
                        <div className={`text-[10px] font-bold ${textColor}`}>{pts}p</div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {/* Fila de totales */}
            <tr className="bg-slate-900 text-white font-bold">
              <td className="sticky left-0 z-10 bg-slate-900 px-3 py-2 border-r border-slate-700">
                TOTAL
              </td>
              <td className="px-2 py-2 border-r border-slate-700"></td>
              {users.map(([uid]) => (
                <td key={uid} className="px-1 py-2 text-center border-r border-slate-700 text-emerald-400 text-[11px]">
                  {totals[uid]}p
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 text-center mt-2">
        Toca las iniciales para ver el nombre completo
      </p>
    </div>
  )
}
