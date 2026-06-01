'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap,
  LogOut,
  RefreshCw,
  Plus,
  Search,
  MapPin,
  Tag,
  Play,
  Pause,
  StopCircle,
  CheckCircle,
  XCircle,
  Users,
  Phone
} from 'lucide-react'

export default function ProspectadorPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [mailings, setMailings] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarNovoMailing, setMostrarNovoMailing] = useState(false)
  const [criandoMailing, setCriandoMailing] = useState(false)
  const [atualizandoStatus, setAtualizandoStatus] = useState<Record<string, boolean>>({})
  const [novoMailing, setNovoMailing] = useState({
    nome: '',
    localizacao: '',
    fontes_ativas: 'google_maps'
  })
  const [nichoInput, setNichoInput] = useState('')
  const [nichosList, setNichosList] = useState<string[]>([])
  const router = useRouter()

  const carregarMailings = async (clienteId: string) => {
    try {
      const res = await fetch(`https://n8n.we7tech.com.br/webhook/listar-mailings?cliente_id=${clienteId}`)
      const data = await res.json()
      if (Array.isArray(data)) setMailings(data)
    } catch (error) {
      console.error('Erro ao carregar mailings:', error)
    }
  }

  const carregarDados = async (clienteId: string) => {
    setCarregando(true)
    try {
      const resCliente = await fetch(`https://n8n.we7tech.com.br/webhook/860d0f1e-f0d8-45b3-b954-70df5ff1a32d?cliente_id=${clienteId}`)
      const dataCliente = await resCliente.json()
      if (dataCliente && dataCliente[0]) setCliente(dataCliente[0])
      await carregarMailings(clienteId)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setCarregando(false)
  }

  useEffect(() => {
    const user = localStorage.getItem('usuario')
    if (!user) { router.push('/'); return }
    const userData = JSON.parse(user)
    if (userData.tipo === 'admin') { router.push('/admin'); return }
    const modulosAtivos = (userData.modulos || '').split(',').map((m: string) => m.trim())
    if (!modulosAtivos.includes('prospectador')) { router.push('/dashboard'); return }
    setUsuario(userData)
    carregarDados(userData.cliente_id || 'movel')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  const handleAdicionarNicho = () => {
    const nicho = nichoInput.trim()
    if (!nicho || nichosList.includes(nicho)) return
    setNichosList([...nichosList, nicho])
    setNichoInput('')
  }

  const handleRemoverNicho = (nicho: string) => {
    setNichosList(nichosList.filter(n => n !== nicho))
  }

  const handleCriarMailing = async () => {
    if (!novoMailing.nome.trim() || !novoMailing.localizacao.trim() || !cliente) return
    setCriandoMailing(true)
    try {
      const response = await fetch('https://n8n.we7tech.com.br/webhook/a9f750c2-b74d-4248-8029-9566eb93a4b8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.cliente_id,
          nome_mailing: novoMailing.nome.trim(),
          fontes_ativas: novoMailing.fontes_ativas,
          localizacao: novoMailing.localizacao.trim(),
          nichos: nichosList.join(', ')
        })
      })
      if (response.ok) {
        setMostrarNovoMailing(false)
        setNovoMailing({ nome: '', localizacao: '', fontes_ativas: 'google_maps' })
        setNichosList([])
        carregarMailings(cliente.cliente_id)
      } else {
        alert('Erro ao criar mailing. Tente novamente.')
      }
    } catch (error) {
      alert('Erro ao criar mailing.')
    }
    setCriandoMailing(false)
  }

  const handleIniciar = async (nomeMailing: string) => {
    if (!cliente) return
    setAtualizandoStatus(prev => ({ ...prev, [nomeMailing]: true }))
    try {
      // 1. Atualiza status para rodando
      await fetch('https://n8n.we7tech.com.br/webhook/atualizar-mailing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: cliente.cliente_id, nome_mailing: nomeMailing, status: 'rodando' })
      })
      // 2. Chama o motor de coleta
      await fetch('https://n8n.we7tech.com.br/webhook/rodar-mailing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: cliente.cliente_id, nome_mailing: nomeMailing })
      })
      await carregarMailings(cliente.cliente_id)
    } catch (error) {
      console.error('Erro ao iniciar mailing:', error)
    }
    setAtualizandoStatus(prev => ({ ...prev, [nomeMailing]: false }))
  }

  const handlePausar = async (nomeMailing: string) => {
    if (!cliente) return
    setAtualizandoStatus(prev => ({ ...prev, [nomeMailing]: true }))
    try {
      await fetch('https://n8n.we7tech.com.br/webhook/atualizar-mailing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: cliente.cliente_id, nome_mailing: nomeMailing, status: 'pausado' })
      })
      await carregarMailings(cliente.cliente_id)
    } catch (error) {
      console.error('Erro ao pausar mailing:', error)
    }
    setAtualizandoStatus(prev => ({ ...prev, [nomeMailing]: false }))
  }

  const handleEncerrar = async (nomeMailing: string) => {
    if (!cliente) return
    if (!confirm(`Encerrar o mailing "${nomeMailing}"? Esta ação não pode ser desfeita.`)) return
    setAtualizandoStatus(prev => ({ ...prev, [nomeMailing]: true }))
    try {
      await fetch('https://n8n.we7tech.com.br/webhook/atualizar-mailing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: cliente.cliente_id, nome_mailing: nomeMailing, status: 'encerrado' })
      })
      await carregarMailings(cliente.cliente_id)
    } catch (error) {
      console.error('Erro ao encerrar mailing:', error)
    }
    setAtualizandoStatus(prev => ({ ...prev, [nomeMailing]: false }))
  }

  const getCorStatus = (status: string) => {
    if (status === 'rodando') return 'border-green-400 bg-green-50'
    if (status === 'encerrado') return 'border-gray-200 bg-gray-50 opacity-70'
    return 'border-gray-200 bg-white'
  }

  const getBadgeStatus = (status: string) => {
    if (status === 'rodando') return 'bg-green-100 text-green-700 border-green-200'
    if (status === 'encerrado') return 'bg-gray-100 text-gray-500 border-gray-200'
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  if (!usuario || carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

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
              <p className="text-xs text-gray-500">{cliente?.nome || usuario.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
              <Phone className="w-4 h-4" /> Disparador
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg font-medium">
              <Users className="w-4 h-4" /> Prospectador
            </button>
            <button onClick={() => carregarDados(cliente?.cliente_id || usuario.cliente_id)} className="p-2 text-gray-500 hover:text-gray-700" title="Atualizar">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
              <LogOut className="w-5 h-5" /><span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Seus Mailings</h2>
            </div>
            <button onClick={() => setMostrarNovoMailing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" /> Novo Mailing
            </button>
          </div>

          {mailings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum mailing criado ainda.</p>
              <p className="text-sm mt-1">Clique em "Novo Mailing" para começar a prospectar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mailings.map((mailing, index) => (
                <div key={index} className={`border-2 rounded-xl p-5 flex flex-col gap-4 transition ${getCorStatus(mailing.status)}`}>

                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base">{mailing.nome_mailing}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{mailing.total_leads || 0} leads coletados</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeStatus(mailing.status)}`}>
                      {mailing.status}
                    </span>
                  </div>

                  {/* Detalhes */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">{mailing.localizacao || '-'}</span>
                    </div>
                    {mailing.nichos && (
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {mailing.nichos.split(',').map((nicho: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                              {nicho.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Fontes:</span>
                      {(mailing.fontes_ativas || '').split(',').map((fonte: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {fonte.trim() === 'google_maps' ? '📍 Google Maps' : fonte.trim() === 'youtube' ? '▶️ YouTube' : fonte.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Botões de controle */}
                  {mailing.status !== 'encerrado' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {mailing.status === 'rodando' ? (
                        <button
                          onClick={() => handlePausar(mailing.nome_mailing)}
                          disabled={atualizandoStatus[mailing.nome_mailing]}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition disabled:opacity-50"
                        >
                          {atualizandoStatus[mailing.nome_mailing] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                          Pausar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleIniciar(mailing.nome_mailing)}
                          disabled={atualizandoStatus[mailing.nome_mailing]}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition disabled:opacity-50"
                        >
                          {atualizandoStatus[mailing.nome_mailing] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          Iniciar
                        </button>
                      )}
                      <button
                        onClick={() => handleEncerrar(mailing.nome_mailing)}
                        disabled={atualizandoStatus[mailing.nome_mailing]}
                        className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Encerrar mailing"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Info da aba */}
                  {mailing.sheet_aba && (
                    <p className="text-xs text-gray-400">Aba na planilha: <span className="font-mono text-gray-600">{mailing.sheet_aba}</span></p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Novo Mailing */}
      {mostrarNovoMailing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Novo Mailing</h3>
              <button onClick={() => { setMostrarNovoMailing(false); setNichosList([]) }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Mailing *</label>
                <input type="text" value={novoMailing.nome} onChange={(e) => setNovoMailing({ ...novoMailing, nome: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Clínicas Vila Madalena" />
                <p className="text-xs text-gray-400 mt-1">Formatado automaticamente para nome da aba na planilha</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1 text-gray-400" />Localização *
                </label>
                <input type="text" value={novoMailing.localizacao} onChange={(e) => setNovoMailing({ ...novoMailing, localizacao: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Vila Madalena, São Paulo" />
                <p className="text-xs text-gray-400 mt-1">Uma localização por mailing — rua, bairro, cidade ou CEP</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="w-4 h-4 inline mr-1 text-gray-400" />Nichos
                </label>
                <div className="flex gap-2">
                  <input type="text" value={nichoInput} onChange={(e) => setNichoInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdicionarNicho() } }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: clínica de estética" />
                  <button onClick={handleAdicionarNicho} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm">Adicionar</button>
                </div>
                {nichosList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {nichosList.map((nicho, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                        {nicho}
                        <button onClick={() => handleRemoverNicho(nicho)} className="hover:text-red-500 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fontes de Dados</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={novoMailing.fontes_ativas.includes('google_maps')} onChange={(e) => {
                      const fontes = novoMailing.fontes_ativas.split(',').filter(f => f.trim())
                      if (e.target.checked) { if (!fontes.includes('google_maps')) fontes.push('google_maps') }
                      else { const idx = fontes.indexOf('google_maps'); if (idx > -1) fontes.splice(idx, 1) }
                      setNovoMailing({ ...novoMailing, fontes_ativas: fontes.join(',') })
                    }} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">📍 Google Maps</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={novoMailing.fontes_ativas.includes('youtube')} onChange={(e) => {
                      const fontes = novoMailing.fontes_ativas.split(',').filter(f => f.trim())
                      if (e.target.checked) { if (!fontes.includes('youtube')) fontes.push('youtube') }
                      else { const idx = fontes.indexOf('youtube'); if (idx > -1) fontes.splice(idx, 1) }
                      setNovoMailing({ ...novoMailing, fontes_ativas: fontes.join(',') })
                    }} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">▶️ YouTube</span>
                  </label>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>💡 Dica:</strong> Após criar, clique em <strong>Iniciar</strong> no card para começar a coletar leads. Os leads aparecerão na aba <strong>{novoMailing.nome ? novoMailing.nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : 'nome_mailing'}</strong> da sua planilha.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setMostrarNovoMailing(false); setNichosList([]) }} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
                <button onClick={handleCriarMailing} disabled={criandoMailing || !novoMailing.nome.trim() || !novoMailing.localizacao.trim()} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  <Plus className="w-4 h-4" />
                  {criandoMailing ? 'Criando...' : 'Criar Mailing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
