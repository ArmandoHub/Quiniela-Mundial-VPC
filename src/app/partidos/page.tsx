import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchCard from '@/components/MatchCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function PartidosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/ranking" className="w-full cursor-pointer">
                  Ranking
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/terceros" className="w-full cursor-pointer">
                  Estadisticas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/grupos" className="w-full cursor-pointer">
                  Fase de grupos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={handleLogout} className="w-full">
                  <button type="submit" className="w-full text-left text-red-500">
                    Salir
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Bienvenido <strong>{user.email}</strong>
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
