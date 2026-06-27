'use client'

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
  'EE.UU.': 'us', 'Estados Unidos': 'us',
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

function Flag({ team }: { team: string }) {
  const code = FLAGS[team]
  if (!code) return <div className="w-6 h-4 bg-slate-700 rounded-sm shrink-0" />
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={team}
      className="h-4 w-6 object-cover rounded-sm shrink-0 ring-1 ring-white/10"
    />
  )
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

type Prediction = {
  predicted_home: number
  predicted_away: number
  points: number | null
}

interface Props {
  matches: Match[]
  predictionMap: Record<string, Prediction>
}

function MatchSlot({ match, prediction }: { match: Match; prediction: Prediction | null }) {
  const date = new Date(match.match_time)
  const dateLabel = date.toLocaleDateString('es-GT', {
    day: 'numeric', month: 'short', timeZone: 'America/Guatemala'
  })

  const homeWon = match.is_finished && (match.home_score ?? 0) > (match.away_score ?? 0)
  const awayWon = match.is_finished && (match.away_score ?? 0) > (match.home_score ?? 0)

  return (
    <div className="w-64 rounded-lg bg-[#111827] border border-slate-800 overflow-hidden shadow-lg shadow-black/30 hover:border-emerald-700/50 transition-colors">
      <div className="px-3 py-1.5 bg-[#0B1120] border-b border-slate-800 flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-mono">{dateLabel}</span>
        {match.is_finished ? (
          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Final</span>
        ) : (
          <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">●&nbsp;Próximo</span>
        )}
      </div>

      <div className="divide-y divide-slate-800">
        {/* Local */}
        <div className={`flex items-center gap-2 px-3 py-2 ${homeWon ? 'bg-emerald-950/40' : ''}`}>
          <Flag team={match.home_team} />
          <span className={`flex-1 text-sm font-semibold truncate ${homeWon ? 'text-emerald-400' : 'text-slate-200'}`}>
            {match.home_team}
          </span>
          <span className={`font-mono text-base font-bold w-6 text-center ${homeWon ? 'text-emerald-400' : 'text-slate-400'}`}>
            {match.home_score ?? '-'}
          </span>
        </div>
        {/* Visitante */}
        <div className={`flex items-center gap-2 px-3 py-2 ${awayWon ? 'bg-emerald-950/40' : ''}`}>
          <Flag team={match.away_team} />
          <span className={`flex-1 text-sm font-semibold truncate ${awayWon ? 'text-emerald-400' : 'text-slate-200'}`}>
            {match.away_team}
          </span>
          <span className={`font-mono text-base font-bold w-6 text-center ${awayWon ? 'text-emerald-400' : 'text-slate-400'}`}>
            {match.away_score ?? '-'}
          </span>
        </div>
      </div>

      {/* Predicción + puntos */}
      {prediction && (
        <div className="px-3 py-1.5 bg-[#0B1120] border-t border-slate-800 flex justify-between items-center">
          <span className="text-[10px] text-slate-500">
            Tu apuesta: <span className="font-mono text-slate-300">{prediction.predicted_home}-{prediction.predicted_away}</span>
          </span>
          {match.is_finished && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              prediction.points === 5 ? 'bg-emerald-500/20 text-emerald-400' :
              prediction.points === 3 ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-700/50 text-slate-500'
            }`}>
              {prediction.points ?? 0} pts
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function BracketView({ matches, predictionMap }: Props) {
  if (matches.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 text-sm">Aún no hay partidos de eliminatoria cargados.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Mundial 2026</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Dieciseisavos de Final</h1>
        <p className="text-sm text-slate-500 mt-1">{matches.length} partidos · Eliminación directa</p>
      </div>

      <div className="flex flex-col gap-4 overflow-x-auto pb-4">
        {matches.map(match => (
          <MatchSlot
            key={match.id}
            match={match}
            prediction={predictionMap[match.id] ?? null}
          />
        ))}
      </div>
    </div>
  )
}
