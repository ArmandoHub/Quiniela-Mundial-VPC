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

  // Partidos finalizados con predicciones de todos los usuarios
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, home_team, away_team, match_time, home_score, away_score, group_name,
      predictions (
        predicted_home, predicted_away, points, is_auto,
        profiles ( display_name )
      )
    `)
    .eq('is_finished', true)
    .order('match_time', { ascending: false })

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
          <AuditAccordion matches={matches ?? []} />
        </section>

        <div className="border-t border-slate-200 pt-6">
          {/* OPCIÓN 2 — Tabla */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">Opción 2</span>
            <h2 className="font-semibold text-slate-700">Tabla por partido</h2>
          </div>
          <AuditTable matches={matches ?? []} />
        </div>
      </main>
    </div>
  )
}
