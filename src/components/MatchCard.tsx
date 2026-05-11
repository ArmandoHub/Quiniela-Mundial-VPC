'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  const isLocked = new Date() >= matchTime

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

        {/* Equipos y predicción */}
        <div className="flex items-center gap-3">
          <span className="flex-1 font-medium text-right">{match.home_team}</span>
          
          {match.is_finished ? (
            /* Resultado final */
            <div className="flex items-center gap-1 text-lg font-bold">
              <span className="w-8 text-center">{match.home_score}</span>
              <span className="text-muted-foreground">-</span>
              <span className="w-8 text-center">{match.away_score}</span>
            </div>
          ) : (
            /* Inputs de predicción */
            <div className="flex items-center gap-1">
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
          
          <span className="flex-1 font-medium">{match.away_team}</span>
        </div>

        {/* Tu predicción + puntos (si terminó) */}
        {match.is_finished && prediction && (
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Tu predicción: <strong>{prediction.predicted_home} - {prediction.predicted_away}</strong>
            </span>
            <Badge className={
              prediction.points === 3 ? 'bg-green-500' :
              prediction.points === 1 ? 'bg-yellow-500' : 'bg-gray-400'
            }>
              {prediction.points} pts
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