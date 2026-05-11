'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Error al enviar el link. Intenta de nuevo.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🏆</div>
          <CardTitle className="text-2xl">Quiniela Mundial 2026</CardTitle>
          <CardDescription>
            Ingresa tu email para recibir tu link de acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-2">
              <div className="text-4xl">📧</div>
              <p className="font-medium">¡Link enviado!</p>
              <p className="text-sm text-muted-foreground">
                Revisa tu correo <strong>{email}</strong> y haz clic en el link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link de acceso'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}