import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from '@/components/NavMenu'
import AuditMatrix from '@/components/AuditMatrix'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RankingTestPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Query 1: partidos finalizados
  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, match_time, home_score, away_score, group_name')
    .eq('is_finished', true)
    .order('match_time', { ascending: true })

  const matchIds = (matches ?? []).map(m => m.id)

  // Query 2: predicciones
  const { data: predictions } = await supabase
    .from('predictions')
    .select('match_id, predicted_home, predicted_away, points, is_auto, user_id')
    .in('match_id', matchIds.length > 0 ? matchIds : ['none'])

  // Query 3: perfiles
  const userIds = [...new Set((predictions ?? []).map(p => p.user_id))]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds.length > 0 ? userIds : ['none'])

  const profileMap = (profiles ?? []).reduce((acc, p) => {
    acc[p.id] = p.display_name
    return acc
  }, {} as Record<string, string>)

  const matchesWithPredictions = (matches ?? []).map(m => ({
    ...m,
    predictions: (predictions ?? [])
      .filter(p => p.match_id === m.id)
      .map(p => ({
        ...p,
        profiles: { display_name: profileMap[p.user_id] ?? 'Sin nombre' }
      }))
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <NavMenu />
        </div>
      </nav>

      <main className="px-4 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Historial de Resultados</h1>
          <p className="text-sm text-slate-500 mt-1">
            Todos los partidos finalizados · {matches?.length ?? 0} partidos · Verde = exacto (5pts) · Amarillo = ganador/empate (3pts)
          </p>
        </div>

        <AuditMatrix matches={matchesWithPredictions as any} />
      </main>
    </div>
  )
}
