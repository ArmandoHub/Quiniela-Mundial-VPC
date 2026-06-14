
'use client'

type Prediction = {
  predicted_home: number
  predicted_away: number
  points: number | null
  is_auto: boolean
  profiles: { display_name: string }[] | { display_name: string } | null
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

export default function AuditTable({ matches }: Props) {
  if (matches.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">No hay partidos finalizados aún.</p>
  }

  return (
    <div className="space-y-6">
      {matches.map(match => {
        const date = new Date(match.match_time).toLocaleDateString('es-GT', {
          weekday: 'short', day: 'numeric', month: 'short',
          timeZone: 'America/Guatemala'
        })
        const predictions = (match.predictions ?? []).sort((a, b) => (b.points ?? 0) - (a.points ?? 0))

        return (
          <div key={match.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
            {/* Header del partido */}
            <div className="px-4 py-3 bg-slate-900 text-white">
              <div className="text-xs text-slate-400 mb-0.5">{date} · {match.group_name}</div>
              <div className="font-bold text-base">
                {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Predicción</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions.map((p, i) => {
                    const name = (Array.isArray(p.profiles) ? p.profiles[0]?.display_name : p.profiles?.display_name) ?? 'Sin nombre'
                    const ptColor =
                      p.points === 5 ? 'text-emerald-600 font-bold' :
                      p.points === 3 ? 'text-amber-600 font-bold' :
                      'text-slate-400'

                    return (
                      <tr key={i} className={`hover:bg-slate-50 ${p.points === 5 ? 'bg-emerald-50/50' : ''}`}>
                        <td className="px-4 py-2.5 text-xs text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-700">
                          {name}
                          {p.is_auto && <span className="text-xs text-slate-400 ml-1">(auto)</span>}
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-600">
                          {p.predicted_home} - {p.predicted_away}
                        </td>
                        <td className={`px-4 py-2.5 text-center ${ptColor}`}>
                          {p.points ?? 0}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
