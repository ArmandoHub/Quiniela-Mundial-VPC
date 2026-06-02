'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Match {
  id: string
  home_team: string
  away_team: string
  match_time: string
  home_score: number | null
  away_score: number | null
  is_finished: boolean
  stage: string
}

interface Props {
  matches: Match[]
}

interface MatchRowState {
  home_score: string
  away_score: string
  is_finished: boolean
  saving: boolean
  saved: boolean
  error: string
}

export default function AdminMatchList({ matches }: Props) {
  const [rows, setRows] = useState<Record<string, MatchRowState>>(() => {
    const init: Record<string, MatchRowState> = {}
    for (const m of matches) {
      init[m.id] = {
        home_score: m.home_score !== null ? String(m.home_score) : '',
        away_score: m.away_score !== null ? String(m.away_score) : '',
        is_finished: m.is_finished ?? false,
        saving: false,
        saved: false,
        error: '',
      }
    }
    return init
  })

  const [filter, setFilter] = useState<'all' | 'pending' | 'finished'>('all')
  const [search, setSearch] = useState('')

  const update = (id: string, field: keyof MatchRowState, value: string | boolean) => {
    setRows(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value, saved: false },
    }))
  }

  const save = async (match: Match) => {
    const row = rows[match.id]
    const homeScore = parseInt(row.home_score)
    const awayScore = parseInt(row.away_score)

    if (isNaN(homeScore) || isNaN(awayScore)) {
      setRows(prev => ({ ...prev, [match.id]: { ...prev[match.id], error: 'Ingresa ambos marcadores.' } }))
      return
    }

    setRows(prev => ({ ...prev, [match.id]: { ...prev[match.id], saving: true, error: '' } }))

    const supabase = createClient()
    const { error } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        is_finished: row.is_finished,
      })
      .eq('id', match.id)

    if (error) {
      setRows(prev => ({ ...prev, [match.id]: { ...prev[match.id], saving: false, error: 'Error al guardar.' } }))
      return
    }

    setRows(prev => ({ ...prev, [match.id]: { ...prev[match.id], saving: false, saved: true } }))
  }

  const filteredMatches = matches.filter(m => {
    const row = rows[m.id]
    if (filter === 'pending' && row.is_finished) return false
    if (filter === 'finished' && !row.is_finished) return false
    if (search) {
      const q = search.toLowerCase()
      if (!m.home_team.toLowerCase().includes(q) && !m.away_team.toLowerCase().includes(q)) return false
    }
    return true
  })

  const pendingCount = matches.filter(m => !rows[m.id].is_finished).length
  const finishedCount = matches.filter(m => rows[m.id].is_finished).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border rounded-xl p-3 text-center shadow-sm">
          <div className="text-2xl font-black text-slate-800">{matches.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total partidos</div>
        </div>
        <div className="bg-white border rounded-xl p-3 text-center shadow-sm">
          <div className="text-2xl font-black text-amber-500">{pendingCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Pendientes</div>
        </div>
        <div className="bg-white border rounded-xl p-3 text-center shadow-sm">
          <div className="text-2xl font-black text-emerald-500">{finishedCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Finalizados</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'finished'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Finalizados'}
          </button>
        ))}
        <input
          type="text"
          placeholder="Buscar equipo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="space-y-2">
        {filteredMatches.map(match => {
          const row = rows[match.id]
          const date = new Date(match.match_time)
          const dateStr = date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })
          const timeStr = date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })

          return (
            <div
              key={match.id}
              className={`bg-white border rounded-xl p-4 shadow-sm ${
                row.is_finished ? 'border-emerald-200 bg-emerald-50/30' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-slate-400 font-medium">
                  {dateStr} {timeStr} · {match.stage}
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.is_finished}
                    onChange={e => update(match.id, 'is_finished', e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className={`text-xs font-medium ${row.is_finished ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {row.is_finished ? 'Finalizado' : 'Marcar finalizado'}
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm font-semibold text-slate-800 text-right">
                  {match.home_team}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={row.home_score}
                    onChange={e => update(match.id, 'home_score', e.target.value)}
                    className="w-12 h-10 text-center text-lg font-bold border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 tabular-nums"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={row.away_score}
                    onChange={e => update(match.id, 'away_score', e.target.value)}
                    className="w-12 h-10 text-center text-lg font-bold border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 tabular-nums"
                  />
                </div>
                <span className="flex-1 text-sm font-semibold text-slate-800">
                  {match.away_team}
                </span>
                <button
                  onClick={() => save(match)}
                  disabled={row.saving}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    row.saved
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-900 text-white hover:bg-slate-700'
                  }`}
                >
                  {row.saving ? '...' : row.saved ? 'Guardado' : 'Guardar'}
                </button>
              </div>

              {row.error && (
                <p className="text-xs text-red-500 mt-2">{row.error}</p>
              )}
            </div>
          )
        })}

        {filteredMatches.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No hay partidos para mostrar
          </div>
        )}
      </div>
    </div>
  )
}
