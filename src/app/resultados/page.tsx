import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from '@/components/NavMenu'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const FLAGS: Record<string, string> = {
  'Mexico': 'mx', 'México': 'mx',
  'Sudafrica': 'za', 'Sudáfrica': 'za',
  'Corea del Sur': 'kr',
  'Chequia': 'cz',
  'Canada': 'ca', 'Canadá': 'ca',
  'Bosnia-Herzegovina': 'ba',
  'Qatar': 'qa',
  'Suiza': 'ch',
  'Brasil': 'br',
  'Marruecos': 'ma',
  'Haiti': 'ht', 'Haití': 'ht',
  'Escocia': 'gb-sct',
  'EE.UU.': 'us',
  'Paraguay': 'py',
  'Australia': 'au',
  'Turquia': 'tr', 'Turquía': 'tr',
  'Alemania': 'de',
  'Curazao': 'cw',
  'Costa de Marfil': 'ci',
  'Ecuador': 'ec',
  'Paises Bajos': 'nl', 'Países Bajos': 'nl',
  'Japon': 'jp', 'Japón': 'jp',
  'Suecia': 'se',
  'Tunez': 'tn', 'Túnez': 'tn',
  'Belgica': 'be', 'Bélgica': 'be',
  'Egipto': 'eg',
  'Iran': 'ir', 'Irán': 'ir',
  'Nueva Zelanda': 'nz',
  'Espana': 'es', 'España': 'es',
  'Cabo Verde': 'cv',
  'Arabia Saudita': 'sa',
  'Uruguay': 'uy',
  'Francia': 'fr',
  'Senegal': 'sn',
  'Irak': 'iq',
  'Noruega': 'no',
  'Argentina': 'ar',
  'Argelia': 'dz',
  'Austria': 'at',
  'Jordania': 'jo',
  'Portugal': 'pt',
  'RD Congo': 'cd',
  'Uzbekistan': 'uz', 'Uzbekistán': 'uz',
  'Colombia': 'co',
  'Inglaterra': 'gb-eng',
  'Croacia': 'hr',
  'Ghana': 'gh',
  'Panama': 'pa', 'Panamá': 'pa',
}

type Match = {
  id: string
  home_team: string
  away_team: string
  match_time: string
  home_score: number | null
  away_score: number | null
  is_finished: boolean
  group_name: string
}

function Flag({ team }: { team: string }) {
  const code = FLAGS[team]
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={team}
      className="h-5 w-7 object-cover rounded-sm border border-slate-200 shrink-0"
    />
  )
}

function groupByDate(matches: Match[]): Record<string, Match[]> {
  return matches.reduce((acc, m) => {
    const date = new Date(m.match_time).toLocaleDateString('es-GT', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(m)
    return acc
  }, {} as Record<string, Match[]>)
}

export default async function ResultadosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, match_time, home_score, away_score, is_finished, group_name')
    .order('match_time', { ascending: false })

  const safeMatches = (matches ?? []) as Match[]
  const now = new Date()

  const live = safeMatches.filter(m => !m.is_finished && new Date(m.match_time) <= now)
  const finished = safeMatches.filter(m => m.is_finished)
  const finishedByDate = groupByDate(finished)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <NavMenu />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* EN JUEGO */}
        {live.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <h2 className="font-bold text-sm text-red-600 uppercase tracking-wide">En juego</h2>
              <span className="text-xs bg-red-100 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-medium">
                {live.length}
              </span>
            </div>
            <div className="space-y-2">
              {live.map(match => (
                <div key={match.id} className="bg-white border border-red-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="text-xs text-slate-400 mb-2">
                    {new Date(match.match_time).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala' })} · {match.group_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-end gap-2">
                      <span className="font-semibold text-sm text-right">{match.home_team}</span>
                      <Flag team={match.home_team} />
                    </div>
                    <div className="flex items-center gap-1 shrink-0 bg-red-50 border border-red-200 rounded-lg px-3 py-1">
                      <span className="text-lg font-black text-slate-800 w-6 text-center">
                        {match.home_score ?? '-'}
                      </span>
                      <span className="text-slate-400 font-bold">-</span>
                      <span className="text-lg font-black text-slate-800 w-6 text-center">
                        {match.away_score ?? '-'}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <Flag team={match.away_team} />
                      <span className="font-semibold text-sm">{match.away_team}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FINALIZADOS */}
        {finished.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-400"></div>
              <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide">Finalizados</h2>
              <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5 font-medium">
                {finished.length}
              </span>
            </div>
            <div className="space-y-4">
              {Object.entries(finishedByDate).map(([date, dayMatches]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                    {date}
                  </p>
                  <div className="space-y-2">
                    {dayMatches.map(match => (
                      <div key={match.id} className="bg-white border rounded-xl px-4 py-3 shadow-sm">
                        <div className="text-xs text-slate-400 mb-2">
                          {new Date(match.match_time).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala' })} · {match.group_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex items-center justify-end gap-2">
                            <span className="font-semibold text-sm text-right">{match.home_team}</span>
                            <Flag team={match.home_team} />
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">
                            <span className="text-lg font-black text-slate-800 w-6 text-center">
                              {match.home_score}
                            </span>
                            <span className="text-slate-400 font-bold">-</span>
                            <span className="text-lg font-black text-slate-800 w-6 text-center">
                              {match.away_score}
                            </span>
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <Flag team={match.away_team} />
                            <span className="font-semibold text-sm">{match.away_team}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {live.length === 0 && finished.length === 0 && (
          <p className="text-center text-slate-400 py-12 text-sm">
            Aún no hay partidos en juego ni finalizados.
          </p>
        )}

      </main>
    </div>
  )
}
