'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <img
              src="/images/vpc-logo.png"
              alt="VPC Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Quiniela VPC</CardTitle>
          <CardDescription>
            {tab === 'login'
              ? 'Ingresa con tu cuenta'
              : 'Crea tu cuenta con tu codigo de acceso'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'login'
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Iniciar sesion
            </button>

            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'register'
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </CardContent>
      </Card>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Credenciales incorrectas. Verifica tu email y contrasena.')
        return
      }

      router.refresh()
      router.push('/bienvenida')
    } catch (err) {
      console.error(err)
      setError('Ocurrio un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Contrasena</label>
        <Input
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  )
}

function RegisterForm() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contrasenias no coinciden.')
      return
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const cleanCode = accessCode.trim()

    // 1. Verificar codigo
    const { data: codeCheck, error: codeError } = await supabase
      .from('access_codes')
      .select('id')
      .eq('code', cleanCode)
      .eq('used', false)
      .maybeSingle()

    if (codeError || !codeCheck) {
      setError(`Debug - code: "${cleanCode}" | result: ${JSON.stringify(codeCheck)} | error: ${JSON.stringify(codeError)}`)
      setLoading(false)
      return
    }

    // 2. Crear usuario
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (signUpError || !authData.user) {
      setError(signUpError?.message ?? 'Error al crear la cuenta.')
      setLoading(false)
      return
    }

    // 3. Guardar display_name en profiles
    await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        display_name: displayName,
        email: email,
      })

    // 4. Reclamar codigo
    const { data: claimResult, error: claimError } = await supabase.rpc(
      'claim_access_code',
      {
        p_code: cleanCode,
        p_user_id: authData.user.id,
      }
    )

    if (claimError || !claimResult?.success) {
      const reason = claimResult?.error
      if (reason === 'already_used') {
        setError('Este codigo ya fue utilizado.')
      } else {
        setError('No se pudo validar el codigo.')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">🎉</div>
        <p className="font-medium">Cuenta creada!</p>
        <p className="text-sm text-muted-foreground">
          Ya puedes iniciar sesion con tu email y contrasena.
        </p>
        <Button className="w-full" onClick={() => window.location.reload()}>
          Ir a iniciar sesion
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Nombre para mostrar</label>
        <Input
          type="text"
          placeholder="Tu nombre"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Contrasena</label>
        <Input
          type="password"
          placeholder="Minimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Confirmar contrasena</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Codigo de acceso
          <span className="text-xs text-muted-foreground font-normal ml-1">
            (recibido al pagar)
          </span>
        </label>
        <Input
          type="text"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          required
          disabled={loading}
          className="font-mono text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-500 break-all">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Verificando...' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
