import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from '@/components/NavMenu'
import AuditAccordion from '@/components/AuditAccordion'
import AuditTable from '@/components/AuditTable'

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
    .order('match_time', { ascending: false })

  // Query 2: predicciones de esos partidos
  const matchIds = (matches ?? []).map(m => m.id)

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

  // Armar estructura combinada
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
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <NavMenu />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Historial de Resultados</h1>
          <p className="text-sm text-slate-500 mt-1">Todos los partidos finalizados con predicciones y puntos</p>
        </div>

        {/* OPCIÓN 1 — Acordeón */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">Opción 1</span>
            <h2 className="font-semibold text-slate-700">Acordeón por partido</h2>
          </div>
          <AuditAccordion matches={matchesWithPredictions as any} />
        </section>

        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">Opción 2</span>
            <h2 className="font-semibold text-slate-700">Tabla por partido</h2>
          </div>
          <AuditTable matches={matchesWithPredictions as any} />
        </div>
      </main>
    </div>
  )
}
