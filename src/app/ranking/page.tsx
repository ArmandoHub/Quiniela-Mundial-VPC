import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function RankingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(100)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">🏆 Quiniela Mundial</span>
          <Link href="/partidos">
            <Button variant="outline" size="sm">Partidos</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>🥇 Ranking Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(leaderboard ?? []).map((entry, idx) => {
                const isMe = entry.user_id === user.id
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
                
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isMe ? 'bg-blue-50 border border-blue-200' : 'bg-white border'
                    }`}
                  >
                    <span className="w-8 text-center font-bold">{medal}</span>
                    <div className="flex-1">
                      <p className="font-medium">
                        {entry.display_name}
                        {isMe && <span className="text-xs text-blue-500 ml-1">(tú)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.exact_results} exactos · {entry.correct_winner} ganadores
                      </p>
                    </div>
                    <Badge className="text-base px-3 py-1">
                      {entry.total_points} pts
                    </Badge>
                  </div>
                )
              })}

              {(!leaderboard || leaderboard.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Aún no hay predicciones. ¡Sé el primero!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}