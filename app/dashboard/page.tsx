'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Phone,
  MessageSquare,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  LogOut,
  FileSpreadsheet,
  TrendingUp,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Users,
  Target,
  Save,
  Plus,
  FolderOpen,
  Image,
  Music,
  Camera,
  Mic,
  StopCircle
} from 'lucide-react'

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [campanhas, setCampanhas] = useState<any[]>([])
  const [stats, setStats] = useState({
    ligacoesHoje: 0,
    atendidas: 0,
    digitou1: 0,
    whatsappEnviados: 0,
    bloqueios: 0,
    semResposta: 0
  })
  const [carregando, setCarregando] = useState(true)
  const [mostrarNovaCampanha, setMostrarNovaCampanha] = useState(false)
  const [novaCampanha, setNovaCampanha] = useState({
    nome: '',
    cadencia_segundos: '30',
    canais_simultaneos: '10'
  })
  const [criandoCampanha, setCriandoCampanha] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({})
  const [uploadFlyerStatus, setUploadFlyerStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({})
  const [uploadAudioStatus, setUploadAudioStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({})
  const [atualizandoStatus, setAtualizandoStatus] = useState<Record<string, boolean>>({})
  const [mostrarConfig, setMostrarConfig] = useState<string | null>(null)
  const [configTemp, setConfigTemp] = useState<Record<string, any>>({})
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const router = useRouter()

  const parseFile = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    if (lines.length < 1) return []
    const firstLine = lines[0]
    let separator = ','
    if (firstLine.includes('\t')) separator = '\t'
    else if (firstLine.includes(';')) separator = ';'
    const firstCols = firstLine.toLowerCase().split(separator).map(c => c.trim().replace(/"/g, ''))
    const hasHeader = firstCols.some(c =>
      c.includes('telefone') || c.includes('phone') || c.includes('cel') ||
      c.includes('nome') || c.includes('name') || c.includes('fone')
    )
    let telIndex = 0, nomeIndex = 1, startLine = 0
    if (hasHeader) {
      telIndex = firstCols.findIndex(h => h.includes('telefone') || h.includes('phone') || h.includes('cel') || h.includes('fone'))
      nomeIndex = firstCols.findIndex(h => h.includes('nome') || h.includes('name'))
      if (telIndex === -1) telIndex = 0
      startLine = 1
    }
    const contatos = []
    for (let i = startLine; i < lines.length; i++) {
      const cols = lines[i].split(separator).map(c => c.trim().replace(/"/g, ''))
      let telefone = cols[telIndex] || ''
      if (cols.length === 1) {
        const numeros = telefone.replace(/\D/g, '')
        if (numeros.length >= 10) telefone = numeros
      }
      if (telefone && telefone.replace(/\D/g, '').length >= 10) {
        contatos.push({ telefone, nome: nomeIndex >= 0 && nomeIndex < cols.length ? cols[nomeIndex] || '' : '' })
      }
    }
    return contatos
  }

  const loadXLSX = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).XLSX) { resolve((window as any).XLSX); return }
      const script = document.createElement('script')
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'
      script.onload = () => resolve((window as any).XLSX)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const parseExcel = async (file: File): Promise<{ telefone: string, nome: string }[]> => {
    const XLSX = await loadXLSX()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
          if (jsonData.length < 1) { resolve([]); return }
          const headers = jsonData[0].map((h: any) => String(h || '').toLowerCase())
          let telIndex = headers.findIndex((h: string) => h.includes('telefone') || h.includes('phone') || h.includes('cel') || h.includes('fone'))
          let nomeIndex = headers.findIndex((h: string) => h.includes('nome') || h.includes('name'))
          let startRow = 0
          if (telIndex === -1) { telIndex = 0; nomeIndex = 1 } else { startRow = 1 }
          const contatos = []
          for (let i = startRow; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (!row || !row[telIndex]) continue
            const telefone = String(row[telIndex] || '')
            if (telefone.replace(/\D/g, '').length >= 10) {
              contatos.push({ telefone, nome: nomeIndex >= 0 ? String(row[nomeIndex] || '') : '' })
            }
          }
          resolve(contatos)
        } catch (err) { reject(err) }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const carregarCampanhas = async (clienteId: string) => {
    try {
      const res = await fetch(`https://n8n.we7tech.com.br/webhook/listar-campanhas?cliente_id=${clienteId}`)
      const data = await res.json()
      if (Array.isArray(data)) setCampanhas(data)
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
    }
  }

  const carregarDados = async (clienteId: string) => {
    setCarregando(true)
    try {
      const resCliente = await fetch(`https://n8n.we7tech.com.br/webhook/860d0f1e-f0d8-45b3-b954-70df5ff1a32d?cliente_id=${clienteId}`)
      const dataCliente = await resCliente.json()
      if (dataCliente && dataCliente[0]) setCliente(dataCliente[0])
      await carregarCampanhas(clienteId)
      const resStats = await fetch(`https://n8n.we7tech.com.br/webhook/dashboard-stats?cliente_id=${clienteId}`)
      const dataStats = await resStats.json()
      if (dataStats && dataStats[0]) setStats(dataStats[0])
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
    setUsuario(userData)
    carregarDados(userData.cliente_id || 'movel')
  }, [router])

  const handleAtualizarStatus = async (nomeCampanha: string, novoStatus: string) => {
    if (!cliente) return
    setAtualizandoStatus(prev => ({ ...prev, [nomeCampanha]: true }))
    try {
      await fetch('https://n8n.we7tech.com.br/webhook/f3544c59-b414-45e2-a247-969b56ae4484', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: cliente.cliente_id, nome_campanha: nomeCampanha, status: novoStatus })
      })
      await carregarCampanhas(cliente.cliente_id)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
    setAtualizandoStatus(prev => ({ ...prev, [nomeCampanha]: false }))
  }

  const handleUploadLeads = async (e: React.ChangeEvent<HTMLInputElement>, nomeCampanha: string) => {
    const file = e.target.files?.[0]
    if (!file || !cliente) return
    setUploadStatus(prev => ({ ...prev, [nomeCampanha]: 'uploading' }))
    try {
      let contatos: { telefone: string, nome: string }[] = []
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        contatos = await parseExcel(file)
      } else {
        contatos = parseFile(await file.text())
      }
      if (contatos.length === 0) {
        alert('Nenhum contato válido encontrado.')
        setUploadStatus(prev => ({ ...prev, [nomeCampanha]: 'error' }))
        e.target.value = ''
        return
      }
      if (!confirm(`Encontrados ${contatos.length} contatos.\n\nDeseja enviar para a campanha "${nomeCampanha}"?`)) {
        setUploadStatus(prev => ({ ...prev, [nomeCampanha]: 'idle' }))
        e.target.value = ''
        return
      }
      const response = await fetch('https://n8n.we7tech.com.br/webhook/d9d44587-e566-4ef7-91f8-8f383391781e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: cliente.cliente_id, sheet_id: cliente.sheet_id, campanha: nomeCampanha, contatos })
      })
      if (response.ok) {
        setUploadStatus(prev => ({ ...prev, [nomeCampanha]: 'success' }))
        setTimeout(() => { setUploadStatus(prev => ({ ...prev, [nomeCampanha]: 'idle' })); carregarCampanhas(cliente.cliente_id) }, 2000)
      } else {
        setUploadStatus(prev => ({ ...prev, [nomeCampanha]: 'error' }))
      }
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [nomeCampanha]: 'error' }))
    }
    e.target.value = ''
  }

  const handleUploadFlyer = async (e: React.ChangeEvent<HTMLInputElement>, nomeCampanha: string) => {
    const file = e.target.files?.[0]
    if (!file || !cliente) return
    setUploadFlyerStatus(prev => ({ ...prev, [nomeCampanha]: 'uploading' }))
    try {
      const formData = new FormData()
      formData.append('flyer', file)
      formData.append('cliente_id', cliente.cliente_id)
      formData.append('nome_campanha', nomeCampanha)
      const response = await fetch('https://n8n.we7tech.com.br/webhook/3468dcb0-c0bb-4b2f-bdb5-7c893cc5e6ed', { method: 'POST', body: formData })
      const data = await response.json()
      if (response.ok && data.sucesso) {
        setUploadFlyerStatus(prev => ({ ...prev, [nomeCampanha]: 'success' }))
        setTimeout(() => { setUploadFlyerStatus(prev => ({ ...prev, [nomeCampanha]: 'idle' })); carregarCampanhas(cliente.cliente_id) }, 2000)
      } else {
        setUploadFlyerStatus(prev => ({ ...prev, [nomeCampanha]: 'error' }))
      }
    } catch (error) {
      setUploadFlyerStatus(prev => ({ ...prev, [nomeCampanha]: 'error' }))
    }
    e.target.value = ''
  }

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>, nomeCampanha: string) => {
    const file = e.target.files?.[0]
    if (!file || !cliente) return
    setUploadAudioStatus(prev => ({ ...prev, [nomeCampanha]: 'uploading' }))
    try {
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('cliente_id', cliente.cliente_id)
      formData.append('nome_campanha', nomeCampanha)
      const response = await fetch('https://n8n.we7tech.com.br/webhook/918ed357-de40-49cc-a2b1-87c99b519f2c', { method: 'POST', body: formData })
      const data = await response.json()
      if (response.ok && data.sucesso) {
        setUploadAudioStatus(prev => ({ ...prev, [nomeCampanha]: 'success' }))
        setTimeout(() => { setUploadAudioStatus(prev => ({ ...prev, [nomeCampanha]: 'idle' })); carregarCampanhas(cliente.cliente_id) }, 2000)
      } else {
        setUploadAudioStatus(prev => ({ ...prev, [nomeCampanha]: 'error' }))
      }
    } catch (error) {
      setUploadAudioStatus(prev => ({ ...prev, [nomeCampanha]: 'error' }))
    }
    e.target.value = ''
  }

  const handleAbrirConfig = (campanha: any) => {
    setConfigTemp({
      nome_campanha: campanha.nome_campanha,
      cadencia_segundos: campanha.cadencia_segundos || '30',
      canais_simultaneos: campanha.canais_simultaneos || '10',
      contexto_ura: campanha.contexto_ura || ''
    })
    setMostrarConfig(campanha.nome_campanha)
  }

  const handleSalvarConfig = async () => {
    if (!cliente) return
    setSalvandoConfig(true)
    try {
      await fetch('https://n8n.we7tech.com.br/webhook/f3544c59-b414-45e2-a247-969b56ae4484', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.cliente_id,
          nome_campanha: configTemp.nome_campanha,
          cadencia_segundos: configTemp.cadencia_segundos,
          canais_simultaneos: configTemp.canais_simultaneos,
          contexto_ura: configTemp.contexto_ura
        })
      })
      setMostrarConfig(null)
      carregarCampanhas(cliente.cliente_id)
    } catch (error) {
      console.error('Erro ao salvar config:', error)
    }
    setSalvandoConfig(false)
  }

  const handleCriarCampanha = async () => {
    if (!novaCampanha.nome.trim() || !cliente) return
    const nomeFormatado = novaCampanha.nome.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    setCriandoCampanha(true)
    try {
      const response = await fetch('https://n8n.we7tech.com.br/webhook/criar-campanha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.cliente_id,
          nome_campanha: nomeFormatado,
          cadencia_segundos: novaCampanha.cadencia_segundos || '30',
          canais_simultaneos: novaCampanha.canais_simultaneos || '10'
        })
      })
      if (response.ok) {
        setMostrarNovaCampanha(false)
        setNovaCampanha({ nome: '', cadencia_segundos: '30', canais_simultaneos: '10' })
        carregarCampanhas(cliente.cliente_id)
      } else {
        alert('Erro ao criar campanha. Tente novamente.')
      }
    } catch (error) {
      alert('Erro ao criar campanha. Tente novamente.')
    }
    setCriandoCampanha(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  const modulosAtivos = (usuario?.modulos || 'motor_ativo').split(',').map((m: string) => m.trim())

  const getCorStatus = (status: string) => {
    if (status === 'ativa') return 'bg-green-100 text-green-700 border-green-200'
    if (status === 'encerrada') return 'bg-gray-100 text-gray-500 border-gray-200'
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
            <button onClick={() => carregarDados(cliente?.cliente_id || usuario.cliente_id)} className="p-2 text-gray-500 hover:text-gray-700" title="Atualizar">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Campanhas */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Suas Campanhas</h2>
            </div>
            <button onClick={() => setMostrarNovaCampanha(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
              Nova Campanha
            </button>
          </div>

          {campanhas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma campanha criada ainda.</p>
              <p className="text-sm mt-1">Clique em "Nova Campanha" para começar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campanhas.map((campanha, index) => (
                <div key={index} className={`border-2 rounded-xl p-5 flex flex-col gap-4 transition ${campanha.status === 'ativa' ? 'border-green-400 bg-green-50' : campanha.status === 'encerrada' ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-200 bg-white'}`}>

                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base">{campanha.nome_campanha}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{campanha.total_leads || 0} leads</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCorStatus(campanha.status)}`}>
                      {campanha.status}
                    </span>
                  </div>

                  {/* Preview do flyer */}
                  {campanha.imagem_url && (
                    <img
                      src={campanha.imagem_url}
                      alt="Flyer"
                      className="w-full h-28 object-cover rounded-lg border border-gray-200"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}

                  {/* Indicadores */}
                  <div className="flex items-center gap-3">
                    {campanha.imagem_url && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                        <Image className="w-3 h-3" /> Flyer
                      </span>
                    )}
                    {campanha.contexto_ura && (
                      <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                        <Music className="w-3 h-3" /> Áudio
                      </span>
                    )}
                  </div>

                  {/* Botões de controle */}
                  <div className="flex items-center gap-2">
                    {campanha.status !== 'encerrada' && (
                      <>
                        {campanha.status === 'ativa' ? (
                          <button
                            onClick={() => handleAtualizarStatus(campanha.nome_campanha, 'pausada')}
                            disabled={atualizandoStatus[campanha.nome_campanha]}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition disabled:opacity-50"
                          >
                            {atualizandoStatus[campanha.nome_campanha] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                            Pausar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAtualizarStatus(campanha.nome_campanha, 'ativa')}
                            disabled={atualizandoStatus[campanha.nome_campanha]}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition disabled:opacity-50"
                          >
                            {atualizandoStatus[campanha.nome_campanha] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            Iniciar
                          </button>
                        )}
                        <button
                          onClick={() => { if (confirm(`Encerrar a campanha "${campanha.nome_campanha}"? Esta ação não pode ser desfeita.`)) handleAtualizarStatus(campanha.nome_campanha, 'encerrada') }}
                          disabled={atualizandoStatus[campanha.nome_campanha]}
                          className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Encerrar campanha"
                        >
                          <StopCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleAbrirConfig(campanha)}
                      className="p-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg transition"
                      title="Configurar campanha"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Botões de upload */}
                  {campanha.status !== 'encerrada' && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <input type="file" accept=".csv,.txt,.tsv,.xlsx,.xls" id={`leads-${campanha.nome_campanha}`} className="hidden" onChange={(e) => handleUploadLeads(e, campanha.nome_campanha)} />
                        <label htmlFor={`leads-${campanha.nome_campanha}`} className="flex flex-col items-center gap-1 py-2 px-1 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-500 rounded-lg cursor-pointer transition border border-gray-200">
                          {uploadStatus[campanha.nome_campanha] === 'uploading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : uploadStatus[campanha.nome_campanha] === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <FileSpreadsheet className="w-4 h-4" />}
                          <span>{uploadStatus[campanha.nome_campanha] === 'success' ? 'Enviado!' : 'Leads'}</span>
                        </label>
                      </div>
                      <div>
                        <input type="file" accept="image/*" id={`flyer-${campanha.nome_campanha}`} className="hidden" onChange={(e) => handleUploadFlyer(e, campanha.nome_campanha)} />
                        <label htmlFor={`flyer-${campanha.nome_campanha}`} className="flex flex-col items-center gap-1 py-2 px-1 text-xs bg-gray-50 hover:bg-green-50 hover:text-green-700 text-gray-500 rounded-lg cursor-pointer transition border border-gray-200">
                          {uploadFlyerStatus[campanha.nome_campanha] === 'uploading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : uploadFlyerStatus[campanha.nome_campanha] === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Camera className="w-4 h-4" />}
                          <span>{uploadFlyerStatus[campanha.nome_campanha] === 'success' ? 'Enviado!' : 'Flyer'}</span>
                        </label>
                      </div>
                      <div>
                        <input type="file" accept="audio/*,.mp3,.ogg,.wav,.m4a" id={`audio-${campanha.nome_campanha}`} className="hidden" onChange={(e) => handleUploadAudio(e, campanha.nome_campanha)} />
                        <label htmlFor={`audio-${campanha.nome_campanha}`} className="flex flex-col items-center gap-1 py-2 px-1 text-xs bg-gray-50 hover:bg-purple-50 hover:text-purple-700 text-gray-500 rounded-lg cursor-pointer transition border border-gray-200">
                          {uploadAudioStatus[campanha.nome_campanha] === 'uploading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : uploadAudioStatus[campanha.nome_campanha] === 'success' ? <CheckCircle className="w-4 h-4 text-purple-600" /> : <Mic className="w-4 h-4" />}
                          <span>{uploadAudioStatus[campanha.nome_campanha] === 'success' ? 'Enviado!' : 'Áudio'}</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Produtos */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Seus Produtos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {modulosAtivos.includes('motor_ativo') && (
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">ATIVO</span>
              </div>
              <h3 className="font-semibold text-gray-800">Discador URA</h3>
              <p className="text-sm text-gray-500 mt-1">{cliente?.canais_simultaneos || 0} canais simultâneos</p>
            </div>
          )}
          {modulosAtivos.includes('prospectador') && (
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-500 cursor-pointer hover:shadow-md transition" onClick={() => router.push('/prospectador')}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">ATIVO</span>
              </div>
              <h3 className="font-semibold text-gray-800">Prospectador</h3>
              <p className="text-sm text-gray-500 mt-1">Google Maps + WhatsApp</p>
            </div>
          )}
        </div>

        {/* Relatórios */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Relatórios de Hoje</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><Phone className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Ligações</span></div>
            <p className="text-2xl font-bold text-gray-800">{stats.ligacoesHoje}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">Atendidas</span></div>
            <p className="text-2xl font-bold text-green-600">{stats.atendidas}</p>
            <p className="text-xs text-gray-400">{stats.ligacoesHoje > 0 ? Math.round(stats.atendidas / stats.ligacoesHoje * 100) : 0}%</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-purple-500" /><span className="text-xs text-gray-500">Interessados</span></div>
            <p className="text-2xl font-bold text-purple-600">{stats.digitou1}</p>
            <p className="text-xs text-gray-400">{stats.ligacoesHoje > 0 ? Math.round(stats.digitou1 / stats.ligacoesHoje * 100) : 0}%</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">WhatsApp</span></div>
            <p className="text-2xl font-bold text-green-600">{stats.whatsappEnviados}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><XCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Bloqueios</span></div>
            <p className="text-2xl font-bold text-red-600">{stats.bloqueios}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-500">Sem Resp.</span></div>
            <p className="text-2xl font-bold text-gray-600">{stats.semResposta}</p>
          </div>
        </div>
      </main>

      {/* Modal Configurar Campanha */}
      {mostrarConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Configurar: {mostrarConfig}</h3>
              <button onClick={() => setMostrarConfig(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cadência (segundos)</label>
                  <input type="number" value={configTemp.cadencia_segundos} onChange={(e) => setConfigTemp({ ...configTemp, cadencia_segundos: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="10" max="300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canais Simultâneos</label>
                  <input type="number" value={configTemp.canais_simultaneos} onChange={(e) => setConfigTemp({ ...configTemp, canais_simultaneos: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="1" max="100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contexto URA</label>
                <input type="text" value={configTemp.contexto_ura} onChange={(e) => setConfigTemp({ ...configTemp, contexto_ura: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: ura-empresa_campanha" />
                <p className="text-xs text-gray-400 mt-1">Preenchido automaticamente ao fazer upload do áudio.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setMostrarConfig(null)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
                <button onClick={handleSalvarConfig} disabled={salvandoConfig} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {salvandoConfig ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Campanha */}
      {mostrarNovaCampanha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Nova Campanha</h3>
              <button onClick={() => setMostrarNovaCampanha(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha *</label>
                <input type="text" value={novaCampanha.nome} onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Promoção Maio, Clientes Inativos..." />
                <p className="text-xs text-gray-400 mt-1">Formatado automaticamente (sem espaços ou caracteres especiais)</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cadência (segundos)</label>
                  <input type="number" value={novaCampanha.cadencia_segundos} onChange={(e) => setNovaCampanha({ ...novaCampanha, cadencia_segundos: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="10" max="300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canais Simultâneos</label>
                  <input type="number" value={novaCampanha.canais_simultaneos} onChange={(e) => setNovaCampanha({ ...novaCampanha, canais_simultaneos: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="1" max="100" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>💡 Dica:</strong> Após criar, use os botões <strong>Leads</strong>, <strong>Flyer</strong> e <strong>Áudio</strong> no card para configurar a campanha.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setMostrarNovaCampanha(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
                <button onClick={handleCriarCampanha} disabled={criandoCampanha || !novaCampanha.nome.trim()} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  <Plus className="w-4 h-4" />
                  {criandoCampanha ? 'Criando...' : 'Criar Campanha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
