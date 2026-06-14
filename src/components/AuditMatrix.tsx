'use client'

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
  if (matches.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">No hay partidos finalizados aún.</p>
  }

  // Obtener lista de usuarios únicos ordenados por nombre
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
    <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
      <table className="text-xs border-collapse min-w-full">
        <thead>
          {/* Fila de nombres de usuarios */}
          <tr className="bg-slate-900 text-white">
            <th className="sticky left-0 z-20 bg-slate-900 px-3 py-2 text-left font-semibold whitespace-nowrap border-r border-slate-700 min-w-[140px]">
              Partido
            </th>
            <th className="px-3 py-2 text-center font-semibold whitespace-nowrap border-r border-slate-700 min-w-[70px]">
              Resultado
            </th>
            {users.map(([uid, name]) => (
              <th key={uid} className="px-2 py-2 text-center font-medium whitespace-nowrap border-r border-slate-700 min-w-[80px]">
                {name}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {matches.map((match, idx) => {
            // Crear mapa de predicciones por usuario para este partido
            const predByUser: Record<string, Prediction> = {}
            match.predictions.forEach(p => {
              predByUser[p.user_id] = p
            })

            return (
              <tr key={match.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {/* Partido */}
                <td className={`sticky left-0 z-10 px-3 py-2 font-medium text-slate-700 border-r border-slate-200 whitespace-nowrap ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <div className="text-[10px] text-slate-400 mb-0.5">{match.group_name}</div>
                  {match.home_team} vs {match.away_team}
                </td>

                {/* Resultado */}
                <td className="px-3 py-2 text-center font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                  {match.home_score} - {match.away_score}
                </td>

                {/* Predicción por usuario */}
                {users.map(([uid]) => {
                  const pred = predByUser[uid]
                  if (!pred) {
                    return (
                      <td key={uid} className="px-2 py-2 text-center text-slate-300 border-r border-slate-100">
                        -
                      </td>
                    )
                  }

                  const pts = pred.points ?? 0
                  const cellColor =
                    pts === 5 ? 'bg-emerald-100 text-emerald-700' :
                    pts === 3 ? 'bg-amber-100 text-amber-700' :
                    pred.is_auto ? 'text-slate-300' : 'text-slate-500'

                  return (
                    <td key={uid} className={`px-2 py-2 text-center border-r border-slate-100 ${cellColor}`}>
                      <div className="font-medium">{pred.predicted_home}-{pred.predicted_away}</div>
                      <div className="text-[10px] font-bold">{pts}pts</div>
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
            <td className="px-3 py-2 border-r border-slate-700"></td>
            {users.map(([uid]) => (
              <td key={uid} className="px-2 py-2 text-center border-r border-slate-700 text-emerald-400">
                {totals[uid]} pts
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
