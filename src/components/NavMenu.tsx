'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NavMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
      >
        Menu
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-md border border-slate-200 bg-white shadow-lg z-50">
          <div className="py-1">
            <Link
              href="/bienvenida"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Bienvenida
            </Link>
            <Link
              href="/partidos"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Pronosticos
            </Link>
            <Link
              href="/ranking"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Ranking
            </Link>
<Link
  href="/resultados"
  onClick={() => setOpen(false)}
  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
>
  Resultados
</Link>
            <Link
              href="/terceros"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Grupos
            </Link>
            <Link
              href="/grupos"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Partidos
            </Link>
            <div className="my-1 h-px bg-slate-100" />
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-slate-50"
            >
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
