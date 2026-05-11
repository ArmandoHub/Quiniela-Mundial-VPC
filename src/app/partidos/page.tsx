import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchCard from '@/components/MatchCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PartidosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traer partidos
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_time', { ascending: true })

  // Traer predicciones del usuario
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)

  // Indexar predicciones por match_id
  const predictionMap = (predictions ?? []).reduce((acc, p) => {
    acc[p.match_id] = p
    return acc
  }, {} as Record<string, typeof predictions[0]>)

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">🏆 Quiniela Mundial</span>
          <div className="flex gap-2">
            <Link href="/ranking">
              <Button variant="outline" size="sm">Ranking</Button>
            </Link>
            <form action={handleLogout}>
              <Button variant="ghost" size="sm" type="submit">Salir</Button>
            </form>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Jugando como <strong>{user.email}</strong>
          </p>
        </div>

        <div className="space-y-3">
          {(matches ?? []).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictionMap[match.id] ?? null}
              userId={user.id}
            />
          ))}
        </div>
      </main>
    </div>
  )
}