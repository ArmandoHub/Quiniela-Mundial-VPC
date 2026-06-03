import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavMenu from '@/components/NavMenu'

export default async function BienvenidaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name ?? user.email

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg">Quiniela VPC</span>
          <NavMenu />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Bienvenida */}
        <div className="bg-white rounded-2xl border p-6 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <img
              src="/images/virgenConcepcion.png"
              alt="Virgen de concepción"
              className="h-14 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            ¡Bienvenido, {displayName}!
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Ya estás listo para participar en la Quiniela Mundial 2026.
          </p>
          <Link href="/partidos" className="inline-block mt-4">
            <button className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
              Ver predicciones
            </button>
          </Link>
        </div>

        {/* Propósito */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Propósito de la Quiniela
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Esta quiniela nace como una forma de unirnos y disfrutar juntos el Mundial 2026.
            Más allá de la competencia, queremos que sea una excusa para compartir, animarnos
            y vivir el fútbol en comunidad.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              Una parte de lo recaudado será destinada al
              <strong> Comité de la Virgen de Concepción</strong>, como un aporte
              de nuestra comunidad a esta causa tan importante. Gracias por participar
              y contribuir con algo más grande.
            </p>
          </div>
        </div>

        {/* Puntuación */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">
            Cómo se acumulan los puntos
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-emerald-500">5</div>
              <div className="font-semibold text-slate-800 text-sm mt-1">Resultado exacto</div>
              <div className="text-xs text-slate-500 mt-1">Aciertas el marcador preciso, ej. 2-1.</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-blue-500">3</div>
              <div className="font-semibold text-slate-800 text-sm mt-1">Ganador correcto</div>
              <div className="text-xs text-slate-500 mt-1">Aciertas quién gana o si hay empate.</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-slate-300">0</div>
              <div className="font-semibold text-slate-800 text-sm mt-1">Fallo</div>
              <div className="text-xs text-slate-500 mt-1">No aciertas el resultado ni el ganador.</div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
              Reglas importantes
            </p>
            <p className="text-sm text-amber-900">
              Los puntos se calculan con el resultado al final del tiempo reglamentario (90 min),
              sin contar tiempo extra ni penales.
            </p>
            <p className="text-sm text-amber-900">
              Si no ingresas una predicción antes del partido, por defecto se quedara el marcador 0 - 0.
            </p>
          </div>
        </div>

        {/* Cómo funcionan las apuestas */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">
            Cómo funcionan las apuestas
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Puedes ingresar tus predicciones desde ya para todos los partidos disponibles.
            Solo tienes que ir a la página de Partidos, elegir el marcador que crees que
            va a quedar y guardar tu apuesta.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
              Atención
            </p>
            <p className="text-sm text-red-800 leading-relaxed">
              Las apuestas se cierran <strong>15 minutos antes</strong> de que inicie cada partido.
              Una vez cerradas, ya no podrás modificar ni ingresar tu predicción para ese partido.
              ¡No te quedes sin apostar!
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Puedes editar tus predicciones cuantas veces quieras antes del cierre.
            Te recomendamos revisar tus apuestas el día del partido para asegurarte
            de que todo esté como quieres.
          </p>
        </div>

        {/* Guía de páginas */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-800">
            Qué hay en cada sección
          </h2>
          <div className="space-y-2">
            <Link href="/partidos" className="block">
              <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-base">
                  S
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Predicciones</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aquí ingresas tus predicciones. Una vez que el partido termina,
                    verás el resultado real y cuántos puntos ganaste.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/ranking" className="block">
              <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0 text-base font-bold text-yellow-700">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Ranking</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tabla de posiciones con todos los participantes ordenados por puntos.
                    Mira dónde estás tú y quién va liderando.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/terceros" className="block">
              <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-base font-bold text-blue-700">
                  E
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Grupo</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Posiciones de cada grupo del Mundial con puntos, goles a favor,
                    goles en contra y diferencia de goles.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/grupos" className="block">
              <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-base font-bold text-emerald-700">
                  G
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Partidos</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calendario completo de los partidos de la fase de grupos con
                    fecha, hora y estadio de cada encuentro.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          Quiniela VPC · Mundial 2026 · ¡Mucha suerte!
        </p>

      </main>
    </div>
  )
}


    
