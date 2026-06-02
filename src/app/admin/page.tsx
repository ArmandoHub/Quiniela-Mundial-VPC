import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminMatchList from '@/components/AdminMatchList'
import NavMenu from '@/components/NavMenu'

const ADMIN_EMAIL = 'josehubb22@gmail.com'

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
        <AdminMatchList matches={matches ?? []} />
      </main>
    </div>
  )
}