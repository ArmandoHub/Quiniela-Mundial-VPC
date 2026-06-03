import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from '@/components/NavMenu'
import AdminMatchList from '@/components/AdminMatchList'

const ADMIN_EMAILS = [
  'josehubb22@gmail.com',
  'dickson.luna17@gmail.com',
  'caperezpastor@gmail.com',
  'ulisessolis94@gmail.com',
]

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!ADMIN_EMAILS.includes(user.email ?? '')) redirect('/partidos')

  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, match_time, home_score, away_score, is_finished, stage')
    .order('match_time', { ascending: true })

  const safeMatches = (matches ?? []).map(m => ({
    id: m.id as string,
    home_team: m.home_team as string,
    away_team: m.away_team as string,
    match_time: m.match_time as string,
    home_score: m.home_score as number | null,
    away_score: m.away_score as number | null,
    is_finished: m.is_finished as boolean,
    stage: m.stage as string,
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Admin — Resultados</span>
          <NavMenu />
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AdminMatchList matches={safeMatches} />
      </main>
    </div>
  )
}
