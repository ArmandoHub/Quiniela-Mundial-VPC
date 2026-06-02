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
  }, {} as Record<string, NonNullable<typeof predictions>[0]>) // TODO => Se cambio debido a errores en el deploy 10/05/2026 21:08

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    /*
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <div className="flex gap-2">
            <Link href="/ranking">
              <Button variant="outline" size="sm">Ranking</Button>
            </Link>
            <Link href="/terceros">
              <Button variant="outline" size="sm">Estadisticas</Button>
            </Link>
            <Link href="/grupos">
              <Button variant="outline" size="sm">Fase de grupos</Button>
            </Link>
            <form action={handleLogout}>
              <Button variant="ghost" size="sm" type="submit">Salir</Button>
            </form>
          </div>
        </div>
      </nav>
    */

    // ------------------------------------------------ INICIO MENU DESPLEGABLE ------------------------------------------------ 
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">⚽ Quiniela VPC</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Menú ▾
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/ranking" className="w-full cursor-pointer">
                  🏆 Ranking
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/terceros" className="w-full cursor-pointer">
                  📊 Estadísticas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/grupos" className="w-full cursor-pointer">
                  📋 Fase de grupos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={handleLogout} className="w-full">
                  <button type="submit" className="w-full text-left text-red-500">
                    🚪 Salir
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      // ------------------------------------------------ FIN MENU DESPLEGABLE ------------------------------------------------ 
              
              
      {/* Contenido */}
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
