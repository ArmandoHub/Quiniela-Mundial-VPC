'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import AuditMatrix from './AuditMatrix'

const KNOCKOUT_STAGES = ['R16', 'R8', 'QF', 'SF', 'FINAL']

const STAGE_LABELS: Record<string, string> = {
  GROUP: 'Fase de Grupos',
  R16: 'Dieciseisavos',
  R8: 'Octavos',
  QF: 'Cuartos',
  SF: 'Semifinal',
  FINAL: 'Final',
}

const STAGE_ORDER = ['GROUP', 'R16', 'R8', 'QF', 'SF', 'FINAL']

function getStageKey(groupName: string): string {
  const normalized = (groupName || '').trim().toUpperCase()
  return KNOCKOUT_STAGES.includes(normalized) ? normalized : 'GROUP'
}

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
  users: { id: string; display_name: string }[]
}

export default function AuditFilters({ matches, users }: Props) {
  const [stageFilter, setStageFilter] = useState<string>('ALL')
  const [userFilter, setUserFilter] = useState<string>('ALL')

  const availableStages = useMemo(() => {
    const set = new Set<string>()
    matches.forEach(m => set.add(getStageKey(m.group_name)))
    return STAGE_ORDER.filter(s => set.has(s))
  }, [matches])

  const filteredMatches = useMemo(() => {
    return matches
      .filter(m => stageFilter === 'ALL' || getStageKey(m.group_name) === stageFilter)
      .map(m => ({
        ...m,
        predictions:
          userFilter === 'ALL'
            ? m.predictions
            : m.predictions.filter(p => p.user_id === userFilter),
      }))
  }, [matches, stageFilter, userFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Fase</label>
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">Todas las fases</option>
            {availableStages.map(s => (
              <option key={s} value={s}>{STAGE_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Usuario</label>
          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">Todos los usuarios</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.display_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-400">
          Mostrando {filteredMatches.length} de {matches.length} partidos
          {userFilter !== 'ALL' &&
            ` · Usuario: ${users.find(u => u.id === userFilter)?.display_name}`}
        </p>

        <Link
          href="/estadisticas"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
        >
          📊 Ver estadísticas
        </Link>
      </div>

      <AuditMatrix matches={filteredMatches} />
    </div>
  )
}
