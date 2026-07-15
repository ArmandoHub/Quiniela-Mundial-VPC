'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'

type Prediction = {
  match_id: string
  predicted_home: number
  predicted_away: number
  points: number | null
  is_auto: boolean
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
}

interface Props {
  matches: Match[]
  predictions: Prediction[]
  users: { id: string; display_name: string }[]
}

const COLORS = [
  '#0f172a', '#059669', '#d97706', '#dc2626', '#2563eb',
  '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#ea580c',
]

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export default function StatsCharts({ matches, predictions, users }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    users.slice(0, 3).map(u => u.id) // arrancamos con menos usuarios para que se lea bien en celular
  )

  const userColor = useMemo(() => {
    const map: Record<string, string> = {}
    users.forEach((u, i) => { map[u.id] = COLORS[i % COLORS.length] })
    return map
  }, [users])

  function toggleUser(uid: string) {
    setSelectedUsers(prev =>
      prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid]
    )
  }

  const progressionData = useMemo(() => {
    const running: Record<string, number> = {}
    users.forEach(u => { running[u.id] = 0 })

    return matches.map((m, idx) => {
      const row: Record<string, any> = {
        idx: idx + 1,
        label: `${m.home_team.slice(0, 3)}-${m.away_team.slice(0, 3)}`,
      }
      const predsForMatch = predictions.filter(p => p.match_id === m.id)
      predsForMatch.forEach(p => {
        running[p.user_id] = (running[p.user_id] ?? 0) + (p.points ?? 0)
      })
      users.forEach(u => { row[u.id] = running[u.id] ?? 0 })
      return row
    })
  }, [matches, predictions, users])

  const accuracyData = useMemo(() => {
    return users.map(u => {
      const own = predictions.filter(p => p.user_id === u.id && !p.is_auto)
      const exactos = own.filter(p => p.points === 5).length
      const ganadores = own.filter(p => p.points === 3).length
      const fallos = own.filter(p => (p.points ?? 0) === 0).length
      const total = own.length || 1
      return {
        name: u.display_name,
        initials: getInitials(u.display_name),
        exactos,
        ganadores,
        fallos,
        totalApuestas: own.length,
        precision: Math.round(((exactos + ganadores) / total) * 100),
      }
    }).sort((a, b) => b.precision - a.precision)
  }, [users, predictions])

  const streaks = useMemo(() => {
    const result: Record<string, number> = {}
    users.forEach(u => {
      const ordered = matches
        .map(m => predictions.find(p => p.match_id === m.id && p.user_id === u.id))
        .filter(Boolean) as Prediction[]

      let best = 0, current = 0
      ordered.forEach(p => {
        if ((p.points ?? 0) > 0) {
          current += 1
          best = Math.max(best, current)
        } else {
          current = 0
        }
      })
      result[u.id] = best
    })
    return result
  }, [matches, predictions, users])

  // En el eje X del gráfico de línea, con muchos partidos el móvil se satura de labels.
  // Mostramos menos ticks en pantallas chicas.
  const xTickInterval = isMobile ? Math.ceil(matches.length / 6) : Math.ceil(matches.length / 12)

  // El gráfico de línea necesita ancho mínimo proporcional a la cantidad de partidos
  // para no aplastarse; en móvil se scrollea horizontalmente en vez de comprimirse.
  const lineChartMinWidth = Math.max(matches.length * (isMobile ? 14 : 8), 320)

  // El gráfico de barras crece verticalmente según la cantidad de usuarios.
  const barChartHeight = Math.max(users.length * (isMobile ? 34 : 28), 200)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Selector de usuarios */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">
          Usuarios en el gráfico de tendencia (toca para agregar/quitar)
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {users.map(u => {
            const active = selectedUsers.includes(u.id)
            return (
              <button
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border transition ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-white text-slate-400 border-slate-200'
                }`}
                style={active ? { backgroundColor: userColor[u.id], borderColor: userColor[u.id] } : {}}
              >
                {u.display_name}
              </button>
            )
          })}
        </div>
        {selectedUsers.length > 5 && (
          <p className="text-[11px] text-amber-600 mt-1.5">
            Con muchos usuarios seleccionados el gráfico se satura — considera dejar 3-4 a la vez.
          </p>
        )}
      </div>

      {/* Gráfico de línea: progresión acumulada, con scroll horizontal en móvil */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Progresión acumulada de puntos</h2>
        <p className="text-xs text-slate-400 mb-3 sm:mb-4">
          Eje X = orden cronológico de partidos · desliza para ver más
        </p>
        <div className="overflow-x-auto">
          <div style={{ minWidth: lineChartMinWidth }} className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="idx"
                  tick={{ fontSize: 10 }}
                  interval={xTickInterval}
                  label={{ value: 'Partido #', position: 'insideBottom', offset: -3, fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip
                  labelFormatter={(idx) => `Partido #${idx}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {selectedUsers.map(uid => {
                  const u = users.find(x => x.id === uid)
                  if (!u) return null
                  return (
                    <Line
                      key={uid}
                      type="monotone"
                      dataKey={uid}
                      name={u.display_name}
                      stroke={userColor[uid]}
                      strokeWidth={2}
                      dot={false}
                    />
                  )
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico de barras: precisión */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Exactos vs Ganadores/Empate vs Fallos</h2>
        <p className="text-xs text-slate-400 mb-3 sm:mb-4">Solo apuestas manuales (excluye 0-0 automáticos)</p>
        <div style={{ height: barChartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracyData} layout="vertical" margin={{ top: 5, right: 12, left: 4, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="initials" width={32} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number, name: string) => [value, name]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="exactos" name="Exactos (5p)" stackId="a" fill="#059669" />
              <Bar dataKey="ganadores" name="Ganador/Empate (3p)" stackId="a" fill="#d97706" />
              <Bar dataKey="fallos" name="Fallos (0p)" stackId="a" fill="#e2e8f0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <h2 className="text-sm font-bold text-slate-900 p-3 sm:p-4 pb-2">Resumen por usuario</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="text-slate-400 border-t border-b">
                <th className="text-left px-3 sm:px-4 py-2 font-medium whitespace-nowrap">Usuario</th>
                <th className="text-center px-2 py-2 font-medium whitespace-nowrap">Apuestas</th>
                <th className="text-center px-2 py-2 font-medium whitespace-nowrap">Exactos</th>
                <th className="text-center px-2 py-2 font-medium whitespace-nowrap">Gan/Emp</th>
                <th className="text-center px-2 py-2 font-medium whitespace-nowrap">% Precisión</th>
                <th className="text-center px-2 py-2 font-medium whitespace-nowrap">Racha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accuracyData.map(row => {
                const u = users.find(x => x.display_name === row.name)
                return (
                  <tr key={row.name}>
                    <td className="px-3 sm:px-4 py-2 font-medium text-slate-700 whitespace-nowrap">{row.name}</td>
                    <td className="px-2 py-2 text-center text-slate-500">{row.totalApuestas}</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-semibold">{row.exactos}</td>
                    <td className="px-2 py-2 text-center text-amber-600 font-semibold">{row.ganadores}</td>
                    <td className="px-2 py-2 text-center font-bold text-slate-900">{row.precision}%</td>
                    <td className="px-2 py-2 text-center text-slate-500">{u ? streaks[u.id] : 0} 🔥</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
