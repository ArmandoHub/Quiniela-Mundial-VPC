'use client'

import { useMemo, useState } from 'react'
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
  matches: Match[] // ordenados por match_time ascendente
  predictions: Prediction[]
  users: { id: string; display_name: string }[]
}

// Paleta fija para que cada usuario mantenga el mismo color entre renders
const COLORS = [
  '#0f172a', '#059669', '#d97706', '#dc2626', '#2563eb',
  '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#ea580c',
]

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export default function StatsCharts({ matches, predictions, users }: Props) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    users.slice(0, 5).map(u => u.id) // por defecto los primeros 5 para no saturar el gráfico
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

  // Progresión acumulada de puntos, partido a partido
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

  // Precisión por usuario: exactos / ganadores-empate / fallos
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

  // Mejor racha de aciertos (exacto o ganador) consecutivos por usuario
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

  return (
    <div className="space-y-8">
      {/* Selector de usuarios para la línea de tendencia */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">
          Usuarios en el gráfico de tendencia (toca para agregar/quitar)
        </p>
        <div className="flex flex-wrap gap-2">
          {users.map(u => {
            const active = selectedUsers.includes(u.id)
            return (
              <button
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
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
      </div>

      {/* Gráfico de línea: progresión acumulada */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Progresión acumulada de puntos</h2>
        <p className="text-xs text-slate-400 mb-4">Eje X = orden cronológico de partidos finalizados</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="idx" tick={{ fontSize: 11 }} label={{ value: 'Partido #', position: 'insideBottom', offset: -3, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(idx) => `Partido #${idx}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
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

      {/* Gráfico de barras: precisión */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Exactos vs Ganadores/Empate vs Fallos</h2>
        <p className="text-xs text-slate-400 mb-4">Solo apuestas manuales (excluye 0-0 automáticos)</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracyData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="initials" width={40} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number, name: string) => [value, name]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="exactos" name="Exactos (5p)" stackId="a" fill="#059669" />
              <Bar dataKey="ganadores" name="Ganador/Empate (3p)" stackId="a" fill="#d97706" />
              <Bar dataKey="fallos" name="Fallos (0p)" stackId="a" fill="#e2e8f0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla resumen: precisión y racha */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <h2 className="text-sm font-bold text-slate-900 p-4 pb-2">Resumen por usuario</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-t border-b">
              <th className="text-left px-4 py-2 font-medium">Usuario</th>
              <th className="text-center px-2 py-2 font-medium">Apuestas</th>
              <th className="text-center px-2 py-2 font-medium">Exactos</th>
              <th className="text-center px-2 py-2 font-medium">Ganador/Empate</th>
              <th className="text-center px-2 py-2 font-medium">% Precisión</th>
              <th className="text-center px-2 py-2 font-medium">Mejor racha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accuracyData.map(row => {
              const u = users.find(x => x.display_name === row.name)
              return (
                <tr key={row.name}>
                  <td className="px-4 py-2 font-medium text-slate-700">{row.name}</td>
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
  )
}
