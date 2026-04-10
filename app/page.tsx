'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    // Simulação de login - depois conecta com backend real
    if (email === 'admin@motorativo.com' && senha === '123456') {
      localStorage.setItem('usuario', JSON.stringify({ 
        nome: 'Administrador', 
        email: email,
        tipo: 'admin'
      }))
      router.push('/admin')
    } else if (email === 'cliente@motormovel.com' && senha === '123456') {
      localStorage.setItem('usuario', JSON.stringify({ 
        nome: 'Motor Movel', 
        email: email,
        tipo: 'cliente',
        cliente_id: 'movel',
        plano: 'Discador URA'
      }))
      router.push('/dashboard')
    } else {
      setErro('Email ou senha incorretos')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Motor Ativo</h1>
          <p className="text-gray-500 mt-1">Plataforma de Vendas Automáticas</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Info de teste */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            <strong>Admin:</strong> admin@motorativo.com / 123456<br/>
            <strong>Cliente:</strong> cliente@motormovel.com / 123456
          </p>
        </div>
      </div>
    </div>
  )
}
