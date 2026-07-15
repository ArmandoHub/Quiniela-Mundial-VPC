import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from '@/components/NavMenu'
import AuditFilters from '@/components/AuditFilters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Trae TODAS las filas de una tabla paginando de 1000 en 1000,
// porque PostgREST/Supabase limita cada respuesta a 1000 registros por defecto.
async function fetchAllPredictions(supabase: any, matchIds: string[]) {
  if (matchIds.length === 0) return []

  const pageSize = 1000
  let allData: any[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('predictions')
      .select('match_id, predicted_home, predicted_away, points, is_auto, user_id')
      .in('match_id', matchIds)
      .range(from, from + pageSize - 1)

    if (error) {
      console.error('Error trayendo predictions:', error)
      break
    }
    if (!data || data.length === 0) break

    allData = allData.concat(data)

    if (data.length < pageSize) break // última página, ya no hay más
    from += pageSize
  }

  return allData
}

export default async function AuditoriaPage() {
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

  // Query 2: predicciones (paginada, trae TODOS los registros sin importar el total)
  const predictions = await fetchAllPredictions(supabase, matchIds)

  // Query 3: perfiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .order('display_name', { ascending: true })

  const profileMap = (profiles ?? []).reduce((acc, p) => {
    acc[p.id] = p.display_name
    return acc
  }, {} as Record<string, string>)

  const matchesWithPredictions = (matches ?? []).map(m => ({
    ...m,
    predictions: predictions
      .filter((p: any) => p.match_id === m.id)
      .map((p: any) => ({
        ...p,
        profiles: { display_name: profileMap[p.user_id] ?? 'Sin nombre' },
      })),
  }))

  // Solo usuarios con al menos una predicción (evita alias vacíos en el dropdown)
  const activeUserIds = new Set(predictions.map((p: any) => p.user_id))
  const users = (profiles ?? [])
    .filter(p => activeUserIds.has(p.id))
    .map(p => ({ id: p.id, display_name: p.display_name }))

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
          <h1 className="text-xl font-bold text-slate-900">Auditoría Filtrada</h1>
          <p className="text-sm text-slate-500 mt-1">
            Filtra por fase del torneo o por usuario · Verde = exacto (5pts) · Amarillo = ganador/empate (3pts)
          </p>
        </div>
        <AuditFilters matches={matchesWithPredictions as any} users={users} />
      </main>
    </div>
  )
}
