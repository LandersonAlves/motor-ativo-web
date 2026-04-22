'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Zap,
  LogOut,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Play,
  Pause,
  DollarSign,
  X,
  RefreshCw,
  Save,
  Mail,
  Calendar,
  MessageSquare,
  Image
} from 'lucide-react'

interface Cliente {
  cliente_id: string
  nome: string
  email: string
  sheet_id: string
  comunix_canal_id: string
  comunix_token: string
  contexto_ura: string
  prompt_ai: string
  canais_simultaneos: string
  cadencia_segundos: string
  horario_inicio: string
  horario_fim: string
  dias_semana: string
  imagem_url: string
  status: string
  ativo: boolean | string
  data_cadastro: string
}

export default function AdminPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [carregando, setCarregando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [novoCliente, setNovoCliente] = useState({
    cliente_id: '',
    nome: '',
    email: '',
    canais_simultaneos: '10',
    cadencia_segundos: '30',
    horario_inicio: '08:00',
    horario_fim: '18:00',
    dias_semana: 'seg,ter,qua,qui,sex',
    contexto_ura: 'ura-motor-movel',
    prompt_ai: '',
    sheet_id: '',
    comunix_canal_id: '',
    comunix_token: '',
    imagem_url: ''
  })
  const [editarCliente, setEditarCliente] = useState<Cliente | null>(null)
  const router = useRouter()

  const carregarClientes = async () => {
    setCarregando(true)
    try {
      const response = await fetch('https://n8n.we7tech.com.br/webhook/85ecaa26-9bc5-4879-97b3-ea97a9fbde6b')
      const data = await response.json()
      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
    setCarregando(false)
  }

  useEffect(() => {
    const user = localStorage.getItem('usuario')
    if (!user) {
      router.push('/')
      return
    }
    const userData = JSON.parse(user)
    if (userData.email !== 'admin@motorativo.com') {
      router.push('/dashboard')
      return
    }
    setUsuario(userData)
    carregarClientes()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    try {
      const response = await fetch('https://n8n.we7tech.com.br/webhook/26e010e6-9b59-47b5-b175-70eed08ce006', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoCliente)
      })
      if (response.ok) {
        setMostrarFormulario(false)
        setNovoCliente({
          cliente_id: '',
          nome: '',
          email: '',
          canais_simultaneos: '10',
          cadencia_segundos: '30',
          horario_inicio: '08:00',
          horario_fim: '18:00',
          dias_semana: 'seg,ter,qua,qui,sex',
          contexto_ura: 'ura-motor-movel',
          prompt_ai: '',
          sheet_id: '',
          comunix_canal_id: '',
          comunix_token: '',
          imagem_url: ''
        })
        carregarClientes()
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    }
    setSalvando(false)
  }

  const handleAtivarPausar = async (clienteId: string, ativar: boolean) => {
    try {
      await fetch('https://n8n.we7tech.com.br/webhook/779475df-8839-4fb5-954a-e0c763a48a6c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          ativo: ativar ? 'true' : 'false',
          status: ativar ? 'ativo' : 'pausado'
        })
      })
      carregarClientes()
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
    }
  }

  const handleVerDetalhes = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setMostrarDetalhes(true)
  }

  const handleAbrirEditar = (cliente: Cliente) => {
    setEditarCliente({ ...cliente })
    setMostrarEditar(true)
  }

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editarCliente) return
    setSalvando(true)
    try {
      await fetch('https://n8n.we7tech.com.br/webhook/779475df-8839-4fb5-954a-e0c763a48a6c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: editarCliente.cliente_id,
          nome: editarCliente.nome,
          email: editarCliente.email,
          canais_simultaneos: editarCliente.canais_simultaneos,
          cadencia_segundos: editarCliente.cadencia_segundos,
          horario_inicio: editarCliente.horario_inicio,
          horario_fim: editarCliente.horario_fim,
          dias_semana: editarCliente.dias_semana,
          contexto_ura: editarCliente.contexto_ura,
          prompt_ai: editarCliente.prompt_ai,
          sheet_id: editarCliente.sheet_id,
          comunix_canal_id: editarCliente.comunix_canal_id,
          comunix_token: editarCliente.comunix_token,
          imagem_url: editarCliente.imagem_url
        })
      })
      setMostrarEditar(false)
      setEditarCliente(null)
      carregarClientes()
    } catch (error) {
      console.error('Erro ao salvar edição:', error)
    }
    setSalvando(false)
  }

  const getStatusBadge = (cliente: Cliente) => {
    const status = cliente.status || (cliente.ativo === true || cliente.ativo === 'true' ? 'ativo' : 'pendente')
    switch(status) {
      case 'ativo':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ativo</span>
      case 'pendente':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
      case 'pausado':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1"><Pause className="w-3 h-3" /> Pausado</span>
      case 'bloqueado':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Bloqueado</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>
    }
  }

  const clientesFiltrados = clientes.filter(c => {
    const matchBusca = (c.nome || '').toLowerCase().includes(busca.toLowerCase()) || 
                       (c.email || '').toLowerCase().includes(busca.toLowerCase()) ||
                       (c.cliente_id || '').toLowerCase().includes(busca.toLowerCase())
    const status = c.status || (c.ativo === true || c.ativo === 'true' ? 'ativo' : 'pendente')
    const matchStatus = filtroStatus === 'todos' || status === filtroStatus
    return matchBusca && matchStatus
  })

  if (!usuario) return null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Motor Ativo</h1>
              <p className="text-xs text-purple-600 font-medium">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen shadow-sm p-4">
          <nav className="space-y-2">
            <a href="/admin" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg font-medium">
              <Users className="w-5 h-5" />
              Clientes
            </a>
            <a href="/admin/financeiro" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5" />
              Financeiro
            </a>
            <a href="/admin/relatorios" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5" />
              Relatórios Gerais
            </a>
            <a href="/admin/configuracoes" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5" />
              Configurações
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header da página */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
              <p className="text-gray-500">Gerencie todos os clientes da plataforma</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={carregarClientes}
                disabled={carregando}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <RefreshCw className={`w-5 h-5 ${carregando ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-5 h-5" />
                Novo Cliente
              </button>
            </div>
          </div>

          {/* Cards resumo */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-800">{clientes.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {clientes.filter(c => c.ativo === true || c.ativo === 'true').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {clientes.filter(c => c.status === 'pendente' || (!c.status && c.ativo !== true && c.ativo !== 'true')).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Canais Totais</p>
              <p className="text-2xl font-bold text-blue-600">
                {clientes.reduce((acc, c) => acc + (parseInt(c.canais_simultaneos) || 0), 0)}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou ID..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="todos">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="pendente">Pendentes</option>
                <option value="pausado">Pausados</option>
                <option value="bloqueado">Bloqueados</option>
              </select>
            </div>
          </div>

          {/* Tabela de clientes */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contexto URA</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Canais</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Horário</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Cadastro</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {carregando ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Carregando...
                    </td>
                  </tr>
                ) : clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente, index) => (
                    <tr key={cliente.cliente_id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{cliente.nome}</p>
                          <p className="text-sm text-gray-500">{cliente.email || cliente.cliente_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700">{cliente.contexto_ura || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(cliente)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{cliente.canais_simultaneos || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {cliente.horario_inicio && cliente.horario_fim 
                            ? `${cliente.horario_inicio} - ${cliente.horario_fim}`
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{cliente.data_cadastro || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleVerDetalhes(cliente)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" 
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" style={{ pointerEvents: 'none' }} />
                          </button>
                          <button 
                            onClick={() => handleAbrirEditar(cliente)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" 
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" style={{ pointerEvents: 'none' }} />
                          </button>
                          {cliente.ativo === true || cliente.ativo === 'true' ? (
                            <button 
                              onClick={() => handleAtivarPausar(cliente.cliente_id, false)}
                              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg" 
                              title="Pausar"
                            >
                              <Pause className="w-4 h-4" style={{ pointerEvents: 'none' }} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleAtivarPausar(cliente.cliente_id, true)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" 
                              title="Ativar"
                            >
                              <Play className="w-4 h-4" style={{ pointerEvents: 'none' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal Novo Cliente */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Novo Cliente</h3>
              <button 
                onClick={() => setMostrarFormulario(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalvarCliente} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Cliente *</label>
                  <input
                    type="text"
                    value={novoCliente.cliente_id}
                    onChange={(e) => setNovoCliente({...novoCliente, cliente_id: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="ex: empresa_xyz"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                  <input
                    type="text"
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Empresa XYZ Ltda"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="contato@empresa.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canais Simultâneos</label>
                  <input
                    type="number"
                    value={novoCliente.canais_simultaneos}
                    onChange={(e) => setNovoCliente({...novoCliente, canais_simultaneos: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cadência (segundos)</label>
                  <input
                    type="number"
                    value={novoCliente.cadencia_segundos}
                    onChange={(e) => setNovoCliente({...novoCliente, cadencia_segundos: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    min="10"
                    max="300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início</label>
                  <input
                    type="time"
                    value={novoCliente.horario_inicio}
                    onChange={(e) => setNovoCliente({...novoCliente, horario_inicio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Fim</label>
                  <input
                    type="time"
                    value={novoCliente.horario_fim}
                    onChange={(e) => setNovoCliente({...novoCliente, horario_fim: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dias da Semana</label>
                  <input
                    type="text"
                    value={novoCliente.dias_semana}
                    onChange={(e) => setNovoCliente({...novoCliente, dias_semana: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="seg,ter,qua,qui,sex"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contexto URA</label>
                <input
                  type="text"
                  value={novoCliente.contexto_ura}
                  onChange={(e) => setNovoCliente({...novoCliente, contexto_ura: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="ura-motor-movel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt da IA</label>
                <textarea
                  value={novoCliente.prompt_ai}
                  onChange={(e) => setNovoCliente({...novoCliente, prompt_ai: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  rows={4}
                  placeholder="Você é um vendedor especialista em..."
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <p className="text-sm text-gray-500 mb-4">Configurações avançadas (preenchidas no onboarding)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sheet ID (Mailing)</label>
                    <input
                      type="text"
                      value={novoCliente.sheet_id}
                      onChange={(e) => setNovoCliente({...novoCliente, sheet_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="ID da planilha do Google"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL do Flyer</label>
                    <input
                      type="text"
                      value={novoCliente.imagem_url}
                      onChange={(e) => setNovoCliente({...novoCliente, imagem_url: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="http://..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comunix Canal ID</label>
                    <input
                      type="text"
                      value={novoCliente.comunix_canal_id}
                      onChange={(e) => setNovoCliente({...novoCliente, comunix_canal_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="ID do canal Comunix"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comunix Token</label>
                    <input
                      type="text"
                      value={novoCliente.comunix_token}
                      onChange={(e) => setNovoCliente({...novoCliente, comunix_token: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Token do Comunix"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalhes */}
      {mostrarDetalhes && clienteSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{clienteSelecionado.nome}</h3>
                <p className="text-sm text-gray-500">{clienteSelecionado.cliente_id}</p>
              </div>
              <button 
                onClick={() => { setMostrarDetalhes(false); setClienteSelecionado(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                {getStatusBadge(clienteSelecionado)}
                <span className="text-sm text-gray-500">
                  Cadastro: {clienteSelecionado.data_cadastro || 'Não informado'}
                </span>
              </div>

              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Informações Básicas
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {clienteSelecionado.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contexto URA</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {clienteSelecionado.contexto_ura || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Configurações de Campanha */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Configurações de Campanha
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Canais Simultâneos</p>
                    <p className="text-sm font-medium">{clienteSelecionado.canais_simultaneos || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cadência</p>
                    <p className="text-sm font-medium">{clienteSelecionado.cadencia_segundos || '-'}s</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dias da Semana</p>
                    <p className="text-sm font-medium">{clienteSelecionado.dias_semana || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Horário Início</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {clienteSelecionado.horario_inicio || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Horário Fim</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {clienteSelecionado.horario_fim || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Integrações */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Integrações
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Sheet ID (Mailing)</p>
                    <p className="text-sm font-medium font-mono bg-white px-2 py-1 rounded">
                      {clienteSelecionado.sheet_id || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Comunix Canal ID</p>
                    <p className="text-sm font-medium font-mono bg-white px-2 py-1 rounded">
                      {clienteSelecionado.comunix_canal_id || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Comunix Token</p>
                    <p className="text-sm font-medium font-mono bg-white px-2 py-1 rounded truncate">
                      {clienteSelecionado.comunix_token ? `${clienteSelecionado.comunix_token.substring(0, 30)}...` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flyer */}
              {clienteSelecionado.imagem_url && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4" /> Flyer
                  </h4>
                  <a 
                    href={clienteSelecionado.imagem_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {clienteSelecionado.imagem_url}
                  </a>
                </div>
              )}

              {/* Prompt IA */}
              {clienteSelecionado.prompt_ai && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Prompt da IA</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {clienteSelecionado.prompt_ai}
                  </p>
                </div>
              )}

              {/* Ações */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => { setMostrarDetalhes(false); handleAbrirEditar(clienteSelecionado); }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {mostrarEditar && editarCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Editar Cliente</h3>
                <p className="text-sm text-gray-500">{editarCliente.cliente_id}</p>
              </div>
              <button 
                onClick={() => { setMostrarEditar(false); setEditarCliente(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Cliente</label>
                  <input
                    type="text"
                    value={editarCliente.cliente_id}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                  <input
                    type="text"
                    value={editarCliente.nome}
                    onChange={(e) => setEditarCliente({...editarCliente, nome: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editarCliente.email || ''}
                  onChange={(e) => setEditarCliente({...editarCliente, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canais Simultâneos</label>
                  <input
                    type="number"
                    value={editarCliente.canais_simultaneos || ''}
                    onChange={(e) => setEditarCliente({...editarCliente, canais_simultaneos: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cadência (segundos)</label>
                  <input
                    type="number"
                    value={editarCliente.cadencia_segundos || ''}
                    onChange={(e) => setEditarCliente({...editarCliente, cadencia_segundos: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    min="10"
                    max="300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início</label>
                  <input
                    type="time"
                    value={editarCliente.horario_inicio || ''}
                    onChange={(e) => setEditarCliente({...editarCliente, horario_inicio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Fim</label>
                  <input
                    type="time"
                    value={editarCliente.horario_fim || ''}
                    onChange={(e) => setEditarCliente({...editarCliente, horario_fim: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dias da Semana</label>
                  <input
                    type="text"
                    value={editarCliente.dias_semana || ''}
                    onChange={(e) => setEditarCliente({...editarCliente, dias_semana: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="seg,ter,qua,qui,sex"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contexto URA</label>
                <input
                  type="text"
                  value={editarCliente.contexto_ura || ''}
                  onChange={(e) => setEditarCliente({...editarCliente, contexto_ura: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt da IA</label>
                <textarea
                  value={editarCliente.prompt_ai || ''}
                  onChange={(e) => setEditarCliente({...editarCliente, prompt_ai: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  rows={4}
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <p className="text-sm text-gray-500 mb-4">Configurações avançadas</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sheet ID (Mailing)</label>
                    <input
                      type="text"
                      value={editarCliente.sheet_id || ''}
                      onChange={(e) => setEditarCliente({...editarCliente, sheet_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL do Flyer</label>
                    <input
                      type="text"
                      value={editarCliente.imagem_url || ''}
                      onChange={(e) => setEditarCliente({...editarCliente, imagem_url: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comunix Canal ID</label>
                    <input
                      type="text"
                      value={editarCliente.comunix_canal_id || ''}
                      onChange={(e) => setEditarCliente({...editarCliente, comunix_canal_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comunix Token</label>
                    <input
                      type="text"
                      value={editarCliente.comunix_token || ''}
                      onChange={(e) => setEditarCliente({...editarCliente, comunix_token: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setMostrarEditar(false); setEditarCliente(null); }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
