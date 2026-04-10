'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Upload, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  Clock,
  Zap,
  LogOut,
  FileSpreadsheet,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [dados, setDados] = useState({
    ligacoesHoje: 0,
    atendidas: 0,
    digitou1: 0,
    whatsappEnviados: 0,
    bloqueios: 0,
    semResposta: 0
  })
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()

  const carregarDados = async () => {
    setCarregando(true)
    try {
      const response = await fetch('https://n8n.we7tech.com.br/webhook/dashboard-stats')
      const data = await response.json()
      if (data && data[0]) {
        setDados(data[0])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setCarregando(false)
  }

  useEffect(() => {
    const user = localStorage.getItem('usuario')
    if (!user) {
      router.push('/')
      return
    }
    setUsuario(JSON.parse(user))
    carregarDados()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  if (!usuario) return null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Motor Ativo</h1>
              <p className="text-xs text-gray-500">{usuario.nome}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Cards de Produtos */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Seus Produtos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Discador URA */}
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                ATIVO
              </span>
            </div>
            <h3 className="font-semibold text-gray-800">Discador URA</h3>
            <p className="text-sm text-gray-500 mt-1">Ligações automáticas com IA</p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-gray-400" />
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                BLOQUEADO
              </span>
            </div>
            <h3 className="font-semibold text-gray-400">Disparo WhatsApp</h3>
            <p className="text-sm text-gray-400 mt-1">Em breve</p>
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-gray-400" />
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                BLOQUEADO
              </span>
            </div>
            <h3 className="font-semibold text-gray-400">Disparo Email</h3>
            <p className="text-sm text-gray-400 mt-1">Em breve</p>
          </div>
        </div>

        {/* Relatórios */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Relatórios de Hoje</h2>
          <button 
            onClick={carregarDados}
            disabled={carregando}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Ligações</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{dados.ligacoesHoje}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Atendidas</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{dados.atendidas}</p>
            <p className="text-xs text-gray-400">
              {dados.ligacoesHoje > 0 ? Math.round(dados.atendidas/dados.ligacoesHoje*100) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Digitou 1</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{dados.digitou1}</p>
            <p className="text-xs text-gray-400">
              {dados.ligacoesHoje > 0 ? Math.round(dados.digitou1/dados.ligacoesHoje*100) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">WhatsApp</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{dados.whatsappEnviados}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Bloqueios</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{dados.bloqueios}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Sem Resp.</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{dados.semResposta}</p>
          </div>
        </div>

        {/* Ações */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Ações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Upload de Planilha</h3>
                <p className="text-sm text-gray-500">Envie sua lista de contatos</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
              <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Arraste um arquivo ou clique para selecionar</p>
              <p className="text-xs text-gray-400 mt-1">CSV ou XLSX até 10MB</p>
            </div>
          </div>

          {/* Campanhas */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Campanhas</h3>
                <p className="text-sm text-gray-500">Gerencie suas campanhas ativas</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Campanha Claro Fibra</span>
                </div>
                <span className="text-xs text-gray-500">{dados.ligacoesHoje} ligações</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Campanha Proteção</span>
                </div>
                <span className="text-xs text-gray-500">Pausada</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
