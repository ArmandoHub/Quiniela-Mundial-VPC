import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from '@/components/NavMenu'
import AdminMatchList from '@/components/AdminMatchList'

const ADMIN_EMAIL = 'josehubb22@gmail.com'

interface Match {
  id: string
  home_team: string
  away_team: string
  match_time: string
  home_score: number | null
  away_score: number | null
  is_finished: boolean
  stage: string
}

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email !== ADMIN_EMAIL) redirect('/partidos')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_time', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Admin — Resultados</span>
          <NavMenu />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <AdminMatchList matches={(matches ?? []) as Match[]} />
      </main>
    </div>
  )
}
