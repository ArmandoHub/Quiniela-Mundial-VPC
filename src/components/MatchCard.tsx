'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

function Flag({ team }: { team: string }) {
  const code = FLAGS[team]
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={team}
      className="h-4 w-6 object-cover rounded-sm border border-slate-200 shrink-0"
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
}

type Prediction = {
  id?: string
  predicted_home: number
  predicted_away: number
  points?: number
}

interface Props {
  match: Match
  prediction: Prediction | null
  userId: string
}

export default function MatchCard({ match, prediction, userId }: Props) {
  const [home, setHome] = useState(prediction?.predicted_home?.toString() ?? '')
  const [away, setAway] = useState(prediction?.predicted_away?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const matchTime = new Date(match.match_time)
  const isLocked = new Date() >= new Date(matchTime.getTime() - 15 * 60 * 1000)

  const handleSave = async () => {
    if (home === '' || away === '') return
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('predictions')
      .upsert({
        user_id: userId,
        match_id: match.id,
        predicted_home: parseInt(home),
        predicted_away: parseInt(away),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,match_id'
      })

    if (error) {
      setError('No se pudo guardar. ¿Ya comenzó el partido?')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <Card className={`${isLocked ? 'opacity-75' : ''}`}>
      <CardContent className="pt-4">
        {/* Tiempo y estado */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted-foreground">
            {matchTime.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
            {' · '}
            {matchTime.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {match.is_finished ? (
            <Badge variant="secondary">Finalizado</Badge>
          ) : isLocked ? (
            <Badge variant="destructive">En juego</Badge>
          ) : (
            <Badge variant="outline" className="text-green-600 border-green-600">Abierto</Badge>
          )}
        </div>

        {/* Equipos */}
        <div className="flex items-center gap-2">
          {/* Local */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className="font-medium text-right text-sm">{match.home_team}</span>
            <Flag team={match.home_team} />
          </div>

          {match.is_finished ? (
            <div className="flex items-center gap-1 text-lg font-bold shrink-0">
              <span className="w-8 text-center">{match.home_score}</span>
              <span className="text-muted-foreground">-</span>
              <span className="w-8 text-center">{match.away_score}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <Input
                type="number"
                min="0"
                max="20"
                value={home}
                onChange={(e) => setHome(e.target.value)}
                disabled={isLocked}
                className="w-12 text-center p-1 h-9"
              />
              <span className="text-muted-foreground font-bold">-</span>
              <Input
                type="number"
                min="0"
                max="20"
                value={away}
                onChange={(e) => setAway(e.target.value)}
                disabled={isLocked}
                className="w-12 text-center p-1 h-9"
              />
            </div>
          )}

          {/* Visitante */}
          <div className="flex-1 flex items-center gap-2">
            <Flag team={match.away_team} />
            <span className="font-medium text-sm">{match.away_team}</span>
          </div>
        </div>

        {/* Tu predicción + puntos (si terminó) */}
        {match.is_finished && prediction && (
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Tu predicción: <strong>{prediction.predicted_home} - {prediction.predicted_away}</strong>
            </span>
            <Badge className={
              prediction.points === 5 ? 'bg-green-500' :
              prediction.points === 3 ? 'bg-yellow-500' : 'bg-gray-400'
            }>
              {prediction.points ?? 0} pts
            </Badge>
          </div>
        )}

        {/* Botón guardar */}
        {!isLocked && !match.is_finished && (
          <div className="mt-3">
            {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
            <Button
              size="sm"
              className="w-full"
              onClick={handleSave}
              disabled={saving || home === '' || away === ''}
              variant={saved ? 'secondary' : 'default'}
            >
              {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar predicción'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
