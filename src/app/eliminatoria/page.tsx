import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from '@/components/NavMenu'
import BracketView from '@/components/BracketView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EliminatoriaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, match_time, home_score, away_score, is_finished, group_name')
    .eq('stage', 'knockout')
    .order('match_time', { ascending: true })

  const { data: predictions } = await supabase
    .from('predictions')
    .select('match_id, predicted_home, predicted_away, points')
    .eq('user_id', user.id)

  const predictionMap = (predictions ?? []).reduce((acc, p) => {
    acc[p.match_id] = p
    return acc
  }, {} as Record<string, any>)

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <nav className="bg-[#0F172A] border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg text-white">Quiniela VPC</span>
          <NavMenu />
        </div>
      </nav>

      <BracketView matches={matches ?? []} predictionMap={predictionMap} />
    </div>
  )
}
