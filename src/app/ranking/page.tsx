import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NavMenu from '@/components/NavMenu'
import RankingList from '@/components/RankingList'

export const revalidate = 0

export default async function RankingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(100)

  // Historial de predicciones del usuario actual
  const { data: history } = await supabase
    .from('predictions')
    .select(`
      id,
      predicted_home,
      predicted_away,
      points,
      matches (
        home_team,
        away_team,
        home_score,
        away_score,
        match_time,
        is_finished
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const finishedHistory = (history ?? []).filter(p => p.matches?.is_finished)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <NavMenu />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <RankingList
          leaderboard={leaderboard ?? []}
          currentUserId={user.id}
          history={finishedHistory}
        />
      </main>
    </div>
  )
}
