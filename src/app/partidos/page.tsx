import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchesAccordion from '@/components/MatchesAccordion'
import NavMenu from '@/components/NavMenu'

export const revalidate = 0

export default async function PartidosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cargar alias
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name ?? user.email

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_time', { ascending: true })

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)

  const predictionMap = (predictions ?? []).reduce((acc, p) => {
    acc[p.match_id] = p
    return acc
  }, {} as Record<string, NonNullable<typeof predictions>[0]>)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <NavMenu />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <p className="text-sm text-muted-foreground">
            Bienvenido <strong>{displayName}</strong>
          </p>
        </div>

        <MatchesAccordion
          matches={matches ?? []}
          predictionMap={predictionMap}
          userId={user.id}
        />
      </main>
    </div>
  )
}
