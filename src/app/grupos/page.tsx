'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

interface Partido {
  fecha: string
  hora: string
  local: string
  visitante: string
  estadio: string
}

interface Grupo {
  nombre: string
  partidos: Partido[]
}

// ─────────────────────────────────────────────────────────────────────────────
// BANDERAS
// ─────────────────────────────────────────────────────────────────────────────

const FLAGS: Record<string, string> = {
  'México': 'mx',
  'Sudáfrica': 'za',
  'Corea del Sur': 'kr',
  'Chequia': 'cz',
  'Canadá': 'ca',
  'Bosnia-Herzegovina': 'ba',
  'Qatar': 'qa',
  'Suiza': 'ch',
  'Brasil': 'br',
  'Marruecos': 'ma',
  'Haití': 'ht',
  'Escocia': 'gb-sct',
  'EE.UU.': 'us',
  'Paraguay': 'py',
  'Australia': 'au',
  'Turquía': 'tr',
  'Alemania': 'de',
  'Curazao': 'cw',
  'Costa de Marfil': 'ci',
  'Ecuador': 'ec',
  'Países Bajos': 'nl',
  'Japón': 'jp',
  'Suecia': 'se',
  'Túnez': 'tn',
  'Bélgica': 'be',
  'Egipto': 'eg',
  'Irán': 'ir',
  'Nueva Zelanda': 'nz',
  'España': 'es',
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
  'Uzbekistán': 'uz',
  'Colombia': 'co',
  'Inglaterra': 'gb-eng',
  'Croacia': 'hr',
  'Ghana': 'gh',
  'Panamá': 'pa',
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE BANDERA
// ─────────────────────────────────────────────────────────────────────────────

function TeamFlag({ country }: { country: string }) {
  const code = FLAGS[country]

  if (!code) return null

  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={`Bandera de ${country}`}
      className="h-4 w-6 object-cover rounded-[2px] border border-slate-200 shadow-sm"
      loading="lazy"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DATOS
// ─────────────────────────────────────────────────────────────────────────────

const GRUPOS: Grupo[] = [
  {
    nombre: 'A',
    partidos: [
      { fecha: '11/06', hora: '13:00', local: 'México', visitante: 'Sudáfrica', estadio: 'Estadio Azteca CDMX' },
      { fecha: '12/06', hora: '20:00', local: 'Corea del Sur', visitante: 'Chequia', estadio: 'Estadio Guadalajara' },
      { fecha: '18/06', hora: '10:00', local: 'Chequia', visitante: 'Sudáfrica', estadio: 'Estadio Atlanta' },
      { fecha: '19/06', hora: '19:00', local: 'México', visitante: 'Corea del Sur', estadio: 'Estadio Guadalajara' },
      { fecha: '25/06', hora: '19:00', local: 'Chequia', visitante: 'México', estadio: 'Estadio Azteca CDMX' },
      { fecha: '25/06', hora: '19:00', local: 'Sudáfrica', visitante: 'Corea del Sur', estadio: 'Estadio Monterrey' },
    ],
  },
  {
    nombre: 'B',
    partidos: [
      { fecha: '12/06', hora: '13:00', local: 'Canadá', visitante: 'Bosnia-Herzegovina', estadio: 'Estadio Toronto' },
      { fecha: '13/06', hora: '13:00', local: 'Qatar', visitante: 'Suiza', estadio: 'Estadio San Francisco' },
      { fecha: '18/06', hora: '13:00', local: 'Suiza', visitante: 'Bosnia-Herzegovina', estadio: 'Estadio Los Ángeles' },
      { fecha: '18/06', hora: '16:00', local: 'Canadá', visitante: 'Qatar', estadio: 'Estadio Vancouver' },
      { fecha: '24/06', hora: '13:00', local: 'Bosnia-Herzegovina', visitante: 'Qatar', estadio: 'Estadio Seattle' },
      { fecha: '24/06', hora: '13:00', local: 'Suiza', visitante: 'Canadá', estadio: 'Estadio Vancouver' },
    ],
  },
  {
    nombre: 'C',
    partidos: [
      { fecha: '13/06', hora: '16:00', local: 'Brasil', visitante: 'Marruecos', estadio: 'Estadio Nueva York/NJ' },
      { fecha: '14/06', hora: '19:00', local: 'Haití', visitante: 'Escocia', estadio: 'Estadio Boston' },
      { fecha: '19/06', hora: '16:00', local: 'Escocia', visitante: 'Marruecos', estadio: 'Estadio Boston' },
      { fecha: '20/06', hora: '19:00', local: 'Brasil', visitante: 'Haití', estadio: 'Estadio Filadelfia' },
      { fecha: '24/06', hora: '16:00', local: 'Marruecos', visitante: 'Haití', estadio: 'Estadio Atlanta' },
      { fecha: '24/06', hora: '16:00', local: 'Escocia', visitante: 'Brasil', estadio: 'Estadio Miami' },
    ],
  },
  {
    nombre: 'D',
    partidos: [
      { fecha: '13/06', hora: '19:00', local: 'EE.UU.', visitante: 'Paraguay', estadio: 'Estadio Los Ángeles' },
      { fecha: '14/06', hora: '22:00', local: 'Australia', visitante: 'Turquía', estadio: 'Estadio Vancouver' },
      { fecha: '19/06', hora: '13:00', local: 'EE.UU.', visitante: 'Australia', estadio: 'Estadio Seattle' },
      { fecha: '20/06', hora: '22:00', local: 'Turquía', visitante: 'Paraguay', estadio: 'Estadio San Francisco' },
      { fecha: '26/06', hora: '20:00', local: 'Paraguay', visitante: 'Australia', estadio: 'Estadio San Francisco' },
      { fecha: '26/06', hora: '20:00', local: 'Turquía', visitante: 'EE.UU.', estadio: 'Estadio Los Ángeles' },
    ],
  },
  {
    nombre: 'E',
    partidos: [
      { fecha: '14/06', hora: '11:00', local: 'Alemania', visitante: 'Curazao', estadio: 'Estadio Houston' },
      { fecha: '15/06', hora: '17:00', local: 'Costa de Marfil', visitante: 'Ecuador', estadio: 'Estadio Filadelfia' },
      { fecha: '20/06', hora: '14:00', local: 'Alemania', visitante: 'Costa de Marfil', estadio: 'Estadio Toronto' },
      { fecha: '21/06', hora: '18:00', local: 'Ecuador', visitante: 'Curazao', estadio: 'Estadio Kansas City' },
      { fecha: '25/06', hora: '14:00', local: 'Curazao', visitante: 'Costa de Marfil', estadio: 'Estadio Filadelfia' },
      { fecha: '25/06', hora: '14:00', local: 'Ecuador', visitante: 'Alemania', estadio: 'Estadio Nueva York/NJ' },
    ],
  },
  {
    nombre: 'F',
    partidos: [
      { fecha: '14/06', hora: '14:00', local: 'Países Bajos', visitante: 'Japón', estadio: 'Estadio Dallas' },
      { fecha: '15/06', hora: '20:00', local: 'Suecia', visitante: 'Túnez', estadio: 'Estadio Monterrey' },
      { fecha: '20/06', hora: '11:00', local: 'Países Bajos', visitante: 'Suecia', estadio: 'Estadio Houston' },
      { fecha: '21/06', hora: '22:00', local: 'Túnez', visitante: 'Japón', estadio: 'Estadio Monterrey' },
      { fecha: '26/06', hora: '17:00', local: 'Japón', visitante: 'Suecia', estadio: 'Estadio Dallas' },
      { fecha: '26/06', hora: '17:00', local: 'Túnez', visitante: 'Países Bajos', estadio: 'Estadio Kansas City' },
    ],
  },
  {
    nombre: 'G',
    partidos: [
      { fecha: '15/06', hora: '13:00', local: 'Bélgica', visitante: 'Egipto', estadio: 'Estadio Seattle' },
      { fecha: '16/06', hora: '19:00', local: 'Irán', visitante: 'Nueva Zelanda', estadio: 'Estadio Los Ángeles' },
      { fecha: '21/06', hora: '13:00', local: 'Bélgica', visitante: 'Irán', estadio: 'Estadio Los Ángeles' },
      { fecha: '22/06', hora: '19:00', local: 'Nueva Zelanda', visitante: 'Egipto', estadio: 'Estadio Vancouver' },
      { fecha: '27/06', hora: '21:00', local: 'Egipto', visitante: 'Irán', estadio: 'Estadio Seattle' },
      { fecha: '27/06', hora: '21:00', local: 'Nueva Zelanda', visitante: 'Bélgica', estadio: 'Estadio Vancouver' },
    ],
  },
  {
    nombre: 'H',
    partidos: [
      { fecha: '15/06', hora: '10:00', local: 'España', visitante: 'Cabo Verde', estadio: 'Estadio Atlanta' },
      { fecha: '15/06', hora: '16:00', local: 'Arabia Saudita', visitante: 'Uruguay', estadio: 'Estadio Miami' },
      { fecha: '21/06', hora: '10:00', local: 'España', visitante: 'Arabia Saudita', estadio: 'Estadio Atlanta' },
      { fecha: '21/06', hora: '16:00', local: 'Uruguay', visitante: 'Cabo Verde', estadio: 'Estadio Miami' },
      { fecha: '27/06', hora: '18:00', local: 'Cabo Verde', visitante: 'Arabia Saudita', estadio: 'Estadio Houston' },
      { fecha: '27/06', hora: '18:00', local: 'Uruguay', visitante: 'España', estadio: 'Estadio Guadalajara' },
    ],
  },
  {
    nombre: 'I',
    partidos: [
      { fecha: '16/06', hora: '13:00', local: 'Francia', visitante: 'Senegal', estadio: 'Estadio Nueva York/NJ' },
      { fecha: '16/06', hora: '16:00', local: 'Irak', visitante: 'Noruega', estadio: 'Estadio Boston' },
      { fecha: '22/06', hora: '15:00', local: 'Francia', visitante: 'Irak', estadio: 'Estadio Filadelfia' },
      { fecha: '23/06', hora: '18:00', local: 'Noruega', visitante: 'Senegal', estadio: 'Estadio Nueva York/NJ' },
      { fecha: '26/06', hora: '13:00', local: 'Noruega', visitante: 'Francia', estadio: 'Estadio Boston' },
      { fecha: '26/06', hora: '13:00', local: 'Senegal', visitante: 'Irak', estadio: 'Estadio Toronto' },
    ],
  },
  {
    nombre: 'J',
    partidos: [
      { fecha: '17/06', hora: '19:00', local: 'Argentina', visitante: 'Argelia', estadio: 'Estadio Kansas City' },
      { fecha: '17/06', hora: '22:00', local: 'Austria', visitante: 'Jordania', estadio: 'Estadio San Francisco' },
      { fecha: '22/06', hora: '11:00', local: 'Argentina', visitante: 'Austria', estadio: 'Estadio Dallas' },
      { fecha: '23/06', hora: '21:00', local: 'Jordania', visitante: 'Argelia', estadio: 'Estadio San Francisco' },
      { fecha: '28/06', hora: '20:00', local: 'Argelia', visitante: 'Austria', estadio: 'Estadio Kansas City' },
      { fecha: '28/06', hora: '20:00', local: 'Jordania', visitante: 'Argentina', estadio: 'Estadio Dallas' },
    ],
  },
  {
    nombre: 'K',
    partidos: [
      { fecha: '17/06', hora: '11:00', local: 'Portugal', visitante: 'RD Congo', estadio: 'Estadio Houston' },
      { fecha: '18/06', hora: '20:00', local: 'Uzbekistán', visitante: 'Colombia', estadio: 'Estadio Azteca CDMX' },
      { fecha: '23/06', hora: '11:00', local: 'Portugal', visitante: 'Uzbekistán', estadio: 'Estadio Houston' },
      { fecha: '24/06', hora: '20:00', local: 'Colombia', visitante: 'RD Congo', estadio: 'Estadio Guadalajara' },
      { fecha: '28/06', hora: '17:30', local: 'Colombia', visitante: 'Portugal', estadio: 'Estadio Miami' },
      { fecha: '28/06', hora: '17:30', local: 'RD Congo', visitante: 'Uzbekistán', estadio: 'Estadio Atlanta' },
    ],
  },
  {
    nombre: 'L',
    partidos: [
      { fecha: '17/06', hora: '14:00', local: 'Inglaterra', visitante: 'Croacia', estadio: 'Estadio Dallas' },
      { fecha: '18/06', hora: '17:00', local: 'Ghana', visitante: 'Panamá', estadio: 'Estadio Toronto' },
      { fecha: '23/06', hora: '14:00', local: 'Inglaterra', visitante: 'Ghana', estadio: 'Estadio Boston' },
      { fecha: '24/06', hora: '17:00', local: 'Panamá', visitante: 'Croacia', estadio: 'Estadio Toronto' },
      { fecha: '27/06', hora: '15:00', local: 'Croacia', visitante: 'Ghana', estadio: 'Estadio Filadelfia' },
      { fecha: '27/06', hora: '15:00', local: 'Panamá', visitante: 'Inglaterra', estadio: 'Estadio Nueva York/NJ' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// COLORES
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function GruposPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const normalizar = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const query = normalizar(search.trim())

  const gruposFiltrados = useMemo(() => {
    if (!query) return GRUPOS

    return GRUPOS.flatMap((grupo) => {
      const matchGrupo =
        normalizar(`grupo ${grupo.nombre}`).includes(query) ||
        normalizar(grupo.nombre) === query

      const partidosFiltrados = grupo.partidos.filter((p) => {
        const matchPais =
          normalizar(p.local).includes(query) ||
          normalizar(p.visitante).includes(query)

        const matchHora =
          p.hora.includes(query) || p.fecha.includes(query)

        const matchEstadio =
          normalizar(p.estadio).includes(query)

        return (
          matchGrupo ||
          matchPais ||
          matchHora ||
          matchEstadio
        )
      })

      if (matchGrupo) {
        return [{ ...grupo }]
      }

      if (partidosFiltrados.length > 0) {
        return [{ ...grupo, partidos: partidosFiltrados }]
      }

      return []
    })
  }, [query])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">🏆 Quiniela Mundial</span>
          <div className="flex gap-2">
            <Link href="/partidos">
              <Button variant="outline" size="sm">Partidos</Button>
            </Link>
            <Link href="/ranking">
              <Button variant="outline" size="sm">Ranking</Button>
            </Link>
            <Link href="/terceros">
              <Button variant="outline" size="sm">Estadísticas</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Salir
            </Button>
          </div>
        </div>
      </nav>

      {/* HEADER con buscador */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Grupos — Mundial 2026
              </h1>
              <p className="text-xs text-slate-500">
                Horarios en hora de Guatemala (CT)
              </p>
            </div>
          </div>

          <Input
            placeholder="Buscar grupo, país o estadio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50"
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {gruposFiltrados.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-3">🔍</div>
            <p>No se encontraron resultados para "{search}"</p>
          </div>
        ) : (
          gruposFiltrados.map((grupo) => (
            <GrupoCard key={grupo.nombre} grupo={grupo} />
          ))
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────────────────────

function GrupoCard({ grupo }: { grupo: Grupo }) {
  const colorClass =
    GRUPO_COLORS[grupo.nombre] ??
    'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-slate-100">
        <CardTitle className="text-base flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-sm font-bold px-2.5 py-0.5 ${colorClass}`}
          >
            Grupo {grupo.nombre}
          </Badge>

          <span className="text-xs text-slate-400 font-normal">
            {grupo.partidos.length} partido
            {grupo.partidos.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {grupo.partidos.map((partido, i) => (
            <PartidoRow
              key={i}
              partido={partido}
              colorClass={colorClass}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROW
// ─────────────────────────────────────────────────────────────────────────────

function PartidoRow({
  partido,
  colorClass,
}: {
  partido: Partido
  colorClass: string
}) {
  return (
    <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 hover:bg-slate-50 transition-colors">

      {/* FECHA */}
      <div className="flex items-center gap-2 sm:w-36 shrink-0">
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {partido.fecha}
        </span>

        <Badge
          variant="outline"
          className={`text-xs font-mono px-1.5 py-0 ${colorClass}`}
        >
          {partido.hora}
        </Badge>
      </div>

      {/* EQUIPOS */}
      <div className="flex-1 flex items-center gap-3 flex-wrap">

        {/* LOCAL */}
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag country={partido.local} />
          <span className="font-semibold text-slate-800 text-sm truncate">
            {partido.local}
          </span>
        </div>

        {/* VS */}
        <span className="text-slate-400 text-xs font-medium">vs</span>

        {/* VISITANTE */}
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag country={partido.visitante} />
          <span className="font-semibold text-slate-800 text-sm truncate">
            {partido.visitante}
          </span>
        </div>
      </div>

      {/* ESTADIO */}
      <div className="text-xs text-slate-400 sm:text-right truncate max-w-[180px]">
        📍 {partido.estadio}
      </div>
    </div>
  )
}
