import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavMenu from '@/components/NavMenu'

const GRUPOS_ORDEN = ['A','B','C','D','E','F','G','H','I','J','K','L']

const GRUPO_COLORS: Record<string, string> = {
  A: 'bg-red-100 text-red-700 border-red-200',
  B: 'bg-orange-100 text-orange-700 border-orange-200',
  C: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  D: 'bg-lime-100 text-lime-700 border-lime-200',
  E: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  F: 'bg-teal-100 text-teal-700 border-teal-200',
  G: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  H: 'bg-sky-100 text-sky-700 border-sky-200',
  I: 'bg-blue-100 text-blue-700 border-blue-200',
  J: 'bg-violet-100 text-violet-700 border-violet-200',
  K: 'bg-purple-100 text-purple-700 border-purple-200',
  L: 'bg-pink-100 text-pink-700 border-pink-200',
}

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

interface Match {
  id: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  is_finished: boolean
  group_name: string
}

interface TeamStats {
  pais: string
  pts: number
  pj: number
  gf: number
  gc: number
}

function calcularGrupos(matches: Match[]): Record<string, TeamStats[]> {
  const grupos: Record<string, Record<string, TeamStats>> = {}

  for (const m of matches) {
    const g = m.group_name
    if (!grupos[g]) grupos[g] = {}

    for (const team of [m.home_team, m.away_team]) {
      if (!grupos[g][team]) {
        grupos[g][team] = { pais: team, pts: 0, pj: 0, gf: 0, gc: 0 }
      }
    }

    if (!m.is_finished || m.home_score === null || m.away_score === null) continue

    const home = grupos[g][m.home_team]
    const away = grupos[g][m.away_team]

    home.pj++; away.pj++
    home.gf += m.home_score; home.gc += m.away_score
    away.gf += m.away_score; away.gc += m.home_score

    if (m.home_score > m.away_score) {
      home.pts += 3
    } else if (m.home_score < m.away_score) {
      away.pts += 3
    } else {
      home.pts += 1; away.pts += 1
    }
  }

  const resultado: Record<string, TeamStats[]> = {}
  for (const g of GRUPOS_ORDEN) {
    if (!grupos[g]) continue
    resultado[g] = Object.values(grupos[g]).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      const dgB = b.gf - b.gc
      const dgA = a.gf - a.gc
      if (dgB !== dgA) return dgB - dgA
      return b.gf - a.gf
    })
  }

  return resultado
}

export default async function TercerosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, home_score, away_score, is_finished, group_name')
    .eq('stage', 'group')

  const grupos = calcularGrupos(matches ?? [])

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <NavMenu />
        </div>
      </nav>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">Estadisticas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Los 8 mejores terceros lugares clasifican a eliminatoria
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GRUPOS_ORDEN.map(g => {
          const equipos = grupos[g]
          if (!equipos) return null
          const colorClass = GRUPO_COLORS[g] ?? 'bg-slate-100 text-slate-700 border-slate-200'

          return (
            <div key={g} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full border ${colorClass}`}>
                  Grupo {g}
                </span>
              </div>

              {/* Columnas */}
              <div className="grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem_2.5rem] px-3 py-1.5 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Pais</span>
                {['Pts','GF','GC','DG'].map(col => (
                  <span key={col} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center">
                    {col}
                  </span>
                ))}
              </div>

              {/* Filas */}
              <div className="divide-y divide-slate-100">
                {equipos.map((equipo, i) => {
                  const pos = i + 1
                  const esTercero = pos === 3
                  const dif = equipo.gf - equipo.gc
                  const difLabel = dif > 0 ? `+${dif}` : `${dif}`
                  const flagCode = FLAGS[equipo.pais]

                  return (
                    <div
                      key={equipo.pais}
                      className={`grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem_2.5rem] items-center px-3 py-2 ${
                        esTercero ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[11px] font-bold w-4 shrink-0 ${
                          pos === 1 ? 'text-yellow-500' :
                          pos === 2 ? 'text-slate-400' :
                          esTercero ? 'text-blue-500' : 'text-slate-300'
                        }`}>{pos}</span>
                        {flagCode && (
                          <img
                            src={`https://flagcdn.com/${flagCode}.svg`}
                            alt={equipo.pais}
                            className="h-4 w-6 object-cover rounded-sm border border-slate-200 shrink-0"
                          />
                        )}
                        <span className={`text-xs truncate ${esTercero ? 'font-bold text-blue-800' : 'font-medium text-slate-700'}`}>
                          {equipo.pais}
                        </span>
                      </div>
                      <span className={`text-center text-xs font-bold tabular-nums ${esTercero ? 'text-blue-800' : 'text-slate-700'}`}>
                        {equipo.pts}
                      </span>
                      <span className="text-center text-xs tabular-nums text-slate-500">{equipo.gf}</span>
                      <span className="text-center text-xs tabular-nums text-slate-500">{equipo.gc}</span>
                      <span className={`text-center text-xs tabular-nums font-medium ${
                        dif > 0 ? 'text-emerald-600' : dif < 0 ? 'text-red-500' : 'text-slate-400'
                      }`}>{difLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
