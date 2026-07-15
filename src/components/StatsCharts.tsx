'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
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

const MOMENTUM_WINDOW = 10

type ChartMode = 'total' | 'momentum' | 'gap'
type SortKey = 'name' | 'totalApuestas' | 'exactos' | 'ganadores' | 'precision' | 'racha'

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

  const totalPointsByUser = useMemo(() => {
    const totals: Record<string, number> = {}
    users.forEach(u => { totals[u.id] = 0 })
    predictions.forEach(p => {
      if (totals[p.user_id] !== undefined) totals[p.user_id] += p.points ?? 0
    })
    return totals
  }, [predictions, users])

  const topUserIds = useMemo(() => {
    return [...users]
      .sort((a, b) => (totalPointsByUser[b.id] ?? 0) - (totalPointsByUser[a.id] ?? 0))
      .slice(0, 5)
      .map(u => u.id)
  }, [users, totalPointsByUser])

  const [selectedUsers, setSelectedUsers] = useState<string[]>(topUserIds.slice(0, 3))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [chartMode, setChartMode] = useState<ChartMode>('gap')

  const userColor = useMemo(() => {
    const map: Record<string, string> = {}
    users.forEach((u, i) => { map[u.id] = COLORS[i % COLORS.length] })
    return map
  }, [users])

  function addUser(uid: string) {
    setSelectedUsers(prev => (prev.includes(uid) ? prev : [...prev, uid]))
    setSearch('')
  }

  function removeUser(uid: string) {
    setSelectedUsers(prev => prev.filter(u => u !== uid))
  }

  const availableUsers = useMemo(() => {
    return users
      .filter(u => !selectedUsers.includes(u.id))
      .filter(u => u.display_name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.display_name.localeCompare(b.display_name))
  }, [users, selectedUsers, search])

  // Puntos por partido (no acumulados) por usuario, en el mismo orden que `matches`
  const matchPointsByUser = useMemo(() => {
    const map: Record<string, number[]> = {}
    users.forEach(u => { map[u.id] = [] })
    matches.forEach(m => {
      const predsForMatch = predictions.filter(p => p.match_id === m.id)
      const byUser: Record<string, number> = {}
      predsForMatch.forEach(p => { byUser[p.user_id] = p.points ?? 0 })
      users.forEach(u => { map[u.id].push(byUser[u.id] ?? 0) })
    })
    return map
  }, [matches, predictions, users])

  // Acumulado por usuario en cada punto (para el modo "total" y para calcular la brecha con el líder)
  const cumulativeByUser = useMemo(() => {
    const map: Record<string, number[]> = {}
    users.forEach(u => {
      let running = 0
      map[u.id] = matchPointsByUser[u.id].map(pts => {
        running += pts
        return running
      })
    })
    return map
  }, [matchPointsByUser, users])

  // Líder global (el más alto entre TODOS los usuarios) en cada punto del torneo
  const leaderCumulative = useMemo(() => {
    return matches.map((_, idx) =>
      Math.max(0, ...users.map(u => cumulativeByUser[u.id]?.[idx] ?? 0))
    )
  }, [matches, users, cumulativeByUser])

  const chartData = useMemo(() => {
    return matches.map((m, idx) => {
      const row: Record<string, any> = { idx: idx + 1 }
      users.forEach(u => {
        if (chartMode === 'total') {
          row[u.id] = cumulativeByUser[u.id]?.[idx] ?? 0
        } else if (chartMode === 'gap') {
          row[u.id] = (cumulativeByUser[u.id]?.[idx] ?? 0) - leaderCumulative[idx]
        } else {
          // momentum: suma de los últimos MOMENTUM_WINDOW partidos
          const pts = matchPointsByUser[u.id] ?? []
          const start = Math.max(0, idx - MOMENTUM_WINDOW + 1)
          row[u.id] = pts.slice(start, idx + 1).reduce((a, b) => a + b, 0)
        }
      })
      return row
    })
  }, [matches, users, chartMode, cumulativeByUser, leaderCumulative, matchPointsByUser])

  const accuracyData = useMemo(() => {
    return users.map(u => {
      const own = predictions.filter(p => p.user_id === u.id && !p.is_auto)
      const exactos = own.filter(p => p.points === 5).length
      const ganadores = own.filter(p => p.points === 3).length
      const total = own.length || 1
      return {
        id: u.id,
        name: u.display_name,
        exactos,
        ganadores,
        totalApuestas: own.length,
        precision: Math.round(((exactos + ganadores) / total) * 100),
      }
    })
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

  // --- Tabla ordenable ---
  const [sortKey, setSortKey] = useState<SortKey>('precision')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedTableData = useMemo(() => {
    const rows = accuracyData.map(row => ({
      ...row,
      racha: streaks[row.id] ?? 0,
    }))
    const dir = sortDir === 'asc' ? 1 : -1
    return rows.sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir
      return ((a[sortKey] as number) - (b[sortKey] as number)) * dir
    })
  }, [accuracyData, streaks, sortKey, sortDir])

  function SortHeader({ label, k, align = 'center' }: { label: string; k: SortKey; align?: 'left' | 'center' }) {
    const active = sortKey === k
    return (
      <th
        onClick={() => handleSort(k)}
        className={`px-2 sm:px-3 py-2 font-medium whitespace-nowrap cursor-pointer select-none hover:text-slate-700 ${
          align === 'left' ? 'text-left' : 'text-center'
        } ${active ? 'text-slate-900' : 'text-slate-400'}`}
      >
        {label} {active ? (sortDir === 'asc' ? '▲' : '▼') : ''}
      </th>
    )
  }

  const xTickInterval = isMobile ? Math.ceil(matches.length / 6) : Math.ceil(matches.length / 12)
  const lineChartMinWidth = Math.max(matches.length * (isMobile ? 14 : 8), 320)

  const chartModeLabels: Record<ChartMode, { title: string; subtitle: string }> = {
    total: {
      title: 'Puntos acumulados',
      subtitle: 'Suma total a lo largo del torneo',
    },
    gap: {
      title: 'Brecha con el líder',
      subtitle: '0 = va en primer lugar en ese momento · negativo = puntos de diferencia contra quien iba primero',
    },
    momentum: {
      title: `Momentum (últimos ${MOMENTUM_WINDOW} partidos)`,
      subtitle: 'Quién está en racha ahora mismo, no en todo el torneo',
    },
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Selector de usuarios */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <p className="text-xs font-medium text-slate-500 mb-2">
          Usuarios en el gráfico de tendencia
        </p>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
          {selectedUsers.length === 0 && (
            <p className="text-xs text-slate-400 italic">Ningún usuario seleccionado.</p>
          )}
          {selectedUsers.map(uid => {
            const u = users.find(x => x.id === uid)
            if (!u) return null
            return (
              <span
                key={uid}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: userColor[uid] }}
              >
                {u.display_name}
                <button
                  onClick={() => removeUser(uid)}
                  className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                  aria-label={`Quitar ${u.display_name}`}
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setSelectedUsers(topUserIds)}
            className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition"
          >
            🏆 Top 5
          </button>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setSelectedUsers([])}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2.5 py-1 rounded-full transition"
            >
              Limpiar todo
            </button>
          )}
          <button
            onClick={() => setPickerOpen(o => !o)}
            className="ml-auto text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-full transition"
          >
            {pickerOpen ? 'Cerrar ✕' : '+ Agregar usuario'}
          </button>
        </div>

        {pickerOpen && (
          <div className="border-t pt-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              autoFocus
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <div className="max-h-56 overflow-y-auto space-y-1">
              {availableUsers.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-3">Sin resultados.</p>
              )}
              {availableUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => addUser(u.id)}
                  className="w-full flex items-center gap-2 text-left px-2 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                    {getInitials(u.display_name)}
                  </span>
                  {u.display_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedUsers.length > 5 && (
          <p className="text-[11px] text-amber-600 mt-2">
            Con muchos usuarios seleccionados el gráfico se satura — considera dejar 3-5 a la vez.
          </p>
        )}
      </div>

      {/* Gráfico de línea: modo seleccionable */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{chartModeLabels[chartMode].title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{chartModeLabels[chartMode].subtitle}</p>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5 shrink-0">
            {(['gap', 'momentum', 'total'] as ChartMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  chartMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {mode === 'gap' ? 'Brecha' : mode === 'momentum' ? 'Momentum' : 'Total'}
              </button>
            ))}
          </div>
        </div>

        {selectedUsers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-12">
            Agrega al menos un usuario para ver la tendencia.
          </p>
        ) : (
          <div className="overflow-x-auto mt-3">
            <div style={{ minWidth: lineChartMinWidth }} className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="idx"
                    tick={{ fontSize: 10 }}
                    interval={xTickInterval}
                    label={{ value: 'Partido #', position: 'insideBottom', offset: -3, fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} width={32} />
                  {chartMode === 'gap' && <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />}
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
        )}
      </div>

      {/* Tabla resumen — ordenable por columna */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <h2 className="text-sm font-bold text-slate-900 p-3 sm:p-4 pb-2">Resumen por usuario</h2>
        <p className="text-[11px] text-slate-400 px-3 sm:px-4 pb-2">Toca un encabezado para ordenar</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="border-t border-b">
                <SortHeader label="Usuario" k="name" align="left" />
                <SortHeader label="Apuestas" k="totalApuestas" />
                <SortHeader label="Exactos" k="exactos" />
                <SortHeader label="Gan/Emp" k="ganadores" />
                <SortHeader label="% Precisión" k="precision" />
                <SortHeader label="Racha" k="racha" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTableData.map(row => (
                <tr key={row.id}>
                  <td className="px-3 sm:px-4 py-2 font-medium text-slate-700 whitespace-nowrap">{row.name}</td>
                  <td className="px-2 py-2 text-center text-slate-500">{row.totalApuestas}</td>
                  <td className="px-2 py-2 text-center text-emerald-600 font-semibold">{row.exactos}</td>
                  <td className="px-2 py-2 text-center text-amber-600 font-semibold">{row.ganadores}</td>
                  <td className="px-2 py-2 text-center font-bold text-slate-900">{row.precision}%</td>
                  <td className="px-2 py-2 text-center text-slate-500">{row.racha} 🔥</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
