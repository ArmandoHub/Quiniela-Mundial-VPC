'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

interface Equipo {
  pais: string
  puntos: number
  gf: number  // goles a favor
  gc: number  // goles en contra
}

interface Grupo {
  nombre: string
  equipos: Equipo[] // ya ordenados por posición (1º→4º)
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

function TeamFlag({ country }: { country: string }) {
  const code = FLAGS[country]
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={country}
      className="h-4 w-6 object-cover rounded-[2px] border border-slate-200 shadow-sm shrink-0"
      loading="lazy"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COLORES DE GRUPOS (mismo que /grupos)
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
// DATOS
// Ordena los equipos de cada grupo de 1º a 4º.
// El 3er lugar (índice 2) es el que compite por los "mejores terceros".
// Actualiza puntos / gf / gc conforme avance el torneo.
// ─────────────────────────────────────────────────────────────────────────────

const GRUPOS: Grupo[] = [
  {
    nombre: 'A',
    equipos: [
      { pais: 'México',       puntos: 0, gf: 0, gc: 0 },
      { pais: 'Corea del Sur',puntos: 0, gf: 0, gc: 0 },
      { pais: 'Chequia',      puntos: 0, gf: 0, gc: 0 },
      { pais: 'Sudáfrica',    puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'B',
    equipos: [
      { pais: 'Canadá',             puntos: 0, gf: 0, gc: 0 },
      { pais: 'Suiza',              puntos: 0, gf: 0, gc: 0 },
      { pais: 'Bosnia-Herzegovina', puntos: 0, gf: 0, gc: 0 },
      { pais: 'Qatar',              puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'C',
    equipos: [
      { pais: 'Brasil',   puntos: 0, gf: 0, gc: 0 },
      { pais: 'Marruecos',puntos: 0, gf: 0, gc: 0 },
      { pais: 'Escocia',  puntos: 0, gf: 0, gc: 0 },
      { pais: 'Haití',    puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'D',
    equipos: [
      { pais: 'EE.UU.',   puntos: 0, gf: 0, gc: 0 },
      { pais: 'Australia',puntos: 0, gf: 0, gc: 0 },
      { pais: 'Turquía',  puntos: 0, gf: 0, gc: 0 },
      { pais: 'Paraguay', puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'E',
    equipos: [
      { pais: 'Alemania',        puntos: 0, gf: 0, gc: 0 },
      { pais: 'Ecuador',         puntos: 0, gf: 0, gc: 0 },
      { pais: 'Costa de Marfil', puntos: 0, gf: 0, gc: 0 },
      { pais: 'Curazao',         puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'F',
    equipos: [
      { pais: 'Países Bajos',puntos: 0, gf: 0, gc: 0 },
      { pais: 'Japón',       puntos: 0, gf: 0, gc: 0 },
      { pais: 'Suecia',      puntos: 0, gf: 0, gc: 0 },
      { pais: 'Túnez',       puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'G',
    equipos: [
      { pais: 'Bélgica',       puntos: 0, gf: 0, gc: 0 },
      { pais: 'Irán',          puntos: 0, gf: 0, gc: 0 },
      { pais: 'Egipto',        puntos: 0, gf: 0, gc: 0 },
      { pais: 'Nueva Zelanda', puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'H',
    equipos: [
      { pais: 'España',        puntos: 0, gf: 0, gc: 0 },
      { pais: 'Uruguay',       puntos: 0, gf: 0, gc: 0 },
      { pais: 'Arabia Saudita',puntos: 0, gf: 0, gc: 0 },
      { pais: 'Cabo Verde',    puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'I',
    equipos: [
      { pais: 'Francia',  puntos: 0, gf: 0, gc: 0 },
      { pais: 'Noruega',  puntos: 0, gf: 0, gc: 0 },
      { pais: 'Senegal',  puntos: 0, gf: 0, gc: 0 },
      { pais: 'Irak',     puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'J',
    equipos: [
      { pais: 'Argentina',puntos: 0, gf: 0, gc: 0 },
      { pais: 'Austria',  puntos: 0, gf: 0, gc: 0 },
      { pais: 'Argelia',  puntos: 0, gf: 0, gc: 0 },
      { pais: 'Jordania', puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'K',
    equipos: [
      { pais: 'Portugal',   puntos: 0, gf: 0, gc: 0 },
      { pais: 'Colombia',   puntos: 0, gf: 0, gc: 0 },
      { pais: 'Uzbekistán', puntos: 0, gf: 0, gc: 0 },
      { pais: 'RD Congo',   puntos: 0, gf: 0, gc: 0 },
    ],
  },
  {
    nombre: 'L',
    equipos: [
      { pais: 'Inglaterra',puntos: 0, gf: 0, gc: 0 },
      { pais: 'Croacia',   puntos: 0, gf: 0, gc: 0 },
      { pais: 'Ghana',     puntos: 0, gf: 0, gc: 0 },
      { pais: 'Panamá',    puntos: 0, gf: 0, gc: 0 },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function TercerosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥉</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Mejores Terceros — Mundial 2026
              </h1>
              <p className="text-xs text-slate-500">
                Los 8 mejores equipos en 3.er lugar clasifican a eliminatoria
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE GRUPOS */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GRUPOS.map((grupo) => (
          <GrupoCard key={grupo.nombre} grupo={grupo} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE GRUPO
// ─────────────────────────────────────────────────────────────────────────────

function GrupoCard({ grupo }: { grupo: Grupo }) {
  const colorClass =
    GRUPO_COLORS[grupo.nombre] ?? 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="py-2.5 px-4 border-b border-slate-100">
        <CardTitle className="text-sm flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-sm font-bold px-2.5 py-0.5 ${colorClass}`}
          >
            Grupo {grupo.nombre}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Cabecera de columnas */}
        <div className="grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem_2.5rem] px-3 py-1.5 bg-slate-50 border-b border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
            País
          </span>
          {['Pts', 'GF', 'GC', 'DG'].map((col) => (
            <span
              key={col}
              className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center"
            >
              {col}
            </span>
          ))}
        </div>

        {/* Filas */}
        <div className="divide-y divide-slate-100">
          {grupo.equipos.map((equipo, i) => (
            <EquipoRow key={equipo.pais} equipo={equipo} posicion={i + 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FILA DE EQUIPO
// ─────────────────────────────────────────────────────────────────────────────

function EquipoRow({
  equipo,
  posicion,
}: {
  equipo: Equipo
  posicion: number
}) {
  const esTercero = posicion === 3
  const dif = equipo.gf - equipo.gc
  const difLabel = dif > 0 ? `+${dif}` : `${dif}`

  return (
    <div
      className={`grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem_2.5rem] items-center px-3 py-2 transition-colors ${
        esTercero ? 'bg-blue-50' : 'hover:bg-slate-50'
      }`}
    >
      {/* PAÍS */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Posición */}
        <span
          className={`text-[11px] font-bold w-4 shrink-0 ${
            posicion === 1
              ? 'text-yellow-500'
              : posicion === 2
              ? 'text-slate-400'
              : esTercero
              ? 'text-blue-500'
              : 'text-slate-300'
          }`}
        >
          {posicion}
        </span>
        <TeamFlag country={equipo.pais} />
        <span
          className={`text-xs truncate ${
            esTercero ? 'font-bold text-blue-800' : 'font-medium text-slate-700'
          }`}
        >
          {equipo.pais}
        </span>
      </div>

      {/* PUNTOS */}
      <span
        className={`text-center text-xs tabular-nums font-bold ${
          esTercero ? 'text-blue-800' : 'text-slate-700'
        }`}
      >
        {equipo.puntos}
      </span>

      {/* GF */}
      <span className="text-center text-xs tabular-nums text-slate-500">
        {equipo.gf}
      </span>

      {/* GC */}
      <span className="text-center text-xs tabular-nums text-slate-500">
        {equipo.gc}
      </span>

      {/* DG */}
      <span
        className={`text-center text-xs tabular-nums font-medium ${
          dif > 0
            ? 'text-emerald-600'
            : dif < 0
            ? 'text-red-500'
            : 'text-slate-400'
        }`}
      >
        {difLabel}
      </span>
    </div>
  )
}
