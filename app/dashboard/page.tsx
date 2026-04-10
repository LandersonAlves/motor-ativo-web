'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Phone, 
  MessageSquare, 
  Mail, 
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
  Calendar,
  Users,
  Target,
  AlertCircle,
  Save
} from 'lucide-react'

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [stats, setStats] = useState({
    ligacoesHoje: 0,
    atendidas: 0,
    digitou1: 0,
    whatsappEnviados: 0,
    bloqueios: 0,
    semResposta: 0
  })
  const [carregando, setCarregando] = useState(true)
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [configTemp, setConfigTemp] = useState({
    horario_inicio: '',
    horario_fim: '',
    dias_semana: '',
    canais_simultaneos: ''
  })
  const [mostrarConfig, setMostrarConfig] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const router = useRouter()

  const parseFile = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    if (lines.length < 1) return []
    
    // Detecta separador (vírgula, ponto-e-vírgula, tab)
    const firstLine = lines[0]
    let separator = ','
    if (firstLine.includes('\t')) separator = '\t'
    else if (firstLine.includes(';')) separator = ';'
    
    // Tenta detectar se tem cabeçalho
    const firstCols = firstLine.toLowerCase().split(separator).map(c => c.trim().replace(/"/g, ''))
    const hasHeader = firstCols.some(c => 
      c.includes('telefone') || c.includes('phone') || c.includes('cel') || 
      c.includes('nome') || c.includes('name') || c.includes('fone')
    )
    
    let telIndex = 0
    let nomeIndex = 1
    let startLine = 0
    
    if (hasHeader) {
      telIndex = firstCols.findIndex(h => 
        h.includes('telefone') || h.includes('phone') || h.includes('cel') || h.includes('fone')
      )
      nomeIndex = firstCols.findIndex(h => 
        h.includes('nome') || h.includes('name')
      )
      if (telIndex === -1) telIndex = 0
      startLine = 1
    }
    
    const contatos = []
    for (let i = startLine; i < lines.length; i++) {
      const cols = lines[i].split(separator).map(c => c.trim().replace(/"/g, ''))
      
      // Pega o valor do telefone
      let telefone = cols[telIndex] || ''
      
      // Se não tem separador, tenta extrair números da linha toda
      if (cols.length === 1) {
        const numeros = telefone.replace(/\D/g, '')
        if (numeros.length >= 10) {
          telefone = numeros
        }
      }
      
      if (telefone && telefone.replace(/\D/g, '').length >= 10) {
        contatos.push({
          telefone: telefone,
          nome: nomeIndex >= 0 && nomeIndex < cols.length ? cols[nomeIndex] || '' : ''
        })
      }
    }
    return contatos
  }

  const loadXLSX = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).XLSX) {
        resolve((window as any).XLSX)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'
      script.onload = () => resolve((window as any).XLSX)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const parseExcel = async (file: File): Promise<{telefone: string, nome: string}[]> => {
    const XLSX = await loadXLSX()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Pega a primeira aba
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          
          // Converte pra JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
          
          if (jsonData.length < 1) {
            resolve([])
            return
          }
          
          // Detecta colunas
          const headers = jsonData[0].map((h: any) => String(h || '').toLowerCase())
          let telIndex = headers.findIndex((h: string) => 
            h.includes('telefone') || h.includes('phone') || h.includes('cel') || h.includes('fone')
          )
          let nomeIndex = headers.findIndex((h: string) => 
            h.includes('nome') || h.includes('name')
          )
          
          // Se não achou cabeçalho, assume primeira coluna = telefone
          let startRow = 0
          if (telIndex === -1) {
            telIndex = 0
            nomeIndex = 1
          } else {
            startRow = 1
          }
          
          const contatos = []
          for (let i = startRow; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (!row || !row[telIndex]) continue
            
            const telefone = String(row[telIndex] || '')
            if (telefone.replace(/\D/g, '').length >= 10) {
              contatos.push({
                telefone,
                nome: nomeIndex >= 0 ? String(row[nomeIndex] || '') : ''
              })
            }
          }
          
          resolve(contatos)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !cliente) return
    
    setUploadStatus('uploading')
    
    try {
      let contatos: {telefone: string, nome: string}[] = []
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        contatos = await parseExcel(file)
      } else {
        const text = await file.text()
        contatos = parseFile(text)
      }
      
      if (contatos.length === 0) {
        alert('Nenhum contato válido encontrado.\n\nVerifique se o arquivo tem telefones com pelo menos 10 dígitos.')
        setUploadStatus('error')
        e.target.value = ''
        return
      }
      
      const confirmar = confirm(`Encontrados ${contatos.length} contatos.\n\nDeseja enviar para a campanha?`)
      if (!confirmar) {
        setUploadStatus('idle')
        e.target.value = ''
        return
      }
      
      const response = await fetch('https://n8n.we7tech.com.br/webhook/d9d44587-e566-4ef7-91f8-8f383391781e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.cliente_id,
          sheet_id: cliente.sheet_id,
          contatos
        })
      })
      
      if (response.ok) {
        setUploadStatus('success')
        alert(`${contatos.length} contatos enviados com sucesso!`)
        setTimeout(() => setUploadStatus('idle'), 3000)
      } else {
        setUploadStatus('error')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      setUploadStatus('error')
      alert('Erro ao processar arquivo. Tente salvar como CSV.')
    }
    
    e.target.value = ''
  }

  const carregarDados = async (clienteId: string) => {
    setCarregando(true)
    try {
      // Buscar dados do cliente
      const resCliente = await fetch(`https://n8n.we7tech.com.br/webhook/860d0f1e-f0d8-45b3-b954-70df5ff1a32d?cliente_id=${clienteId}`)
      const dataCliente = await resCliente.json()
      if (dataCliente && dataCliente[0]) {
        setCliente(dataCliente[0])
        setConfigTemp({
          horario_inicio: dataCliente[0].horario_inicio || '08:00',
          horario_fim: dataCliente[0].horario_fim || '18:00',
          dias_semana: dataCliente[0].dias_semana || 'seg,ter,qua,qui,sex',
          canais_simultaneos: dataCliente[0].canais_simultaneos || '10'
        })
      }

      // Buscar estatísticas
      const resStats = await fetch('https://n8n.we7tech.com.br/webhook/dashboard-stats')
      const dataStats = await resStats.json()
      if (dataStats && dataStats[0]) {
        setStats(dataStats[0])
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
    const userData = JSON.parse(user)
    if (userData.tipo === 'admin') {
      router.push('/admin')
      return
    }
    setUsuario(userData)
    carregarDados(userData.cliente_id || 'movel')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  const handleIniciarPausar = async () => {
    if (!cliente) return
    const novoStatus = cliente.ativo === true || cliente.ativo === 'true' ? false : true
    try {
      await fetch('https://n8n.we7tech.com.br/webhook/779475df-8839-4fb5-954a-e0c763a48a6c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.cliente_id,
          ativo: novoStatus ? 'true' : 'false',
          status: novoStatus ? 'ativo' : 'pausado'
        })
      })
      carregarDados(cliente.cliente_id)
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  const handleSalvarConfig = async () => {
    if (!cliente) return
    setSalvandoConfig(true)
    try {
      await fetch('https://n8n.we7tech.com.br/webhook/779475df-8839-4fb5-954a-e0c763a48a6c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.cliente_id,
          horario_inicio: configTemp.horario_inicio,
          horario_fim: configTemp.horario_fim,
          dias_semana: configTemp.dias_semana,
          canais_simultaneos: configTemp.canais_simultaneos
        })
      })
      setMostrarConfig(false)
      carregarDados(cliente.cliente_id)
    } catch (error) {
      console.error('Erro ao salvar config:', error)
    }
    setSalvandoConfig(false)
  }

  const getStatusCampanha = () => {
    if (!cliente) return { status: 'carregando', texto: 'Carregando...', cor: 'gray' }
    
    const ativo = cliente.ativo === true || cliente.ativo === 'true'
    const status = cliente.status || (ativo ? 'ativo' : 'pendente')
    
    if (status === 'finalizada') return { status: 'finalizada', texto: 'Campanha Finalizada', cor: 'blue', icon: CheckCircle }
    if (status === 'bloqueado') return { status: 'bloqueado', texto: 'Conta Bloqueada', cor: 'red', icon: XCircle }
    if (status === 'pausado' || !ativo) return { status: 'pausado', texto: 'Campanha Pausada', cor: 'yellow', icon: Pause }
    if (status === 'ativo' && ativo) return { status: 'ativo', texto: 'Campanha Ativa', cor: 'green', icon: Play }
    return { status: 'pendente', texto: 'Aguardando Configuração', cor: 'gray', icon: Clock }
  }

  const statusCampanha = getStatusCampanha()

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
            <button 
              onClick={() => carregarDados(cliente?.cliente_id || 'movel')}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Atualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status da Campanha */}
        <div className={`bg-${statusCampanha.cor}-50 border border-${statusCampanha.cor}-200 rounded-xl p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${statusCampanha.cor}-100 rounded-full flex items-center justify-center`}>
                {statusCampanha.status === 'ativo' && <Play className={`w-6 h-6 text-green-600`} />}
                {statusCampanha.status === 'pausado' && <Pause className={`w-6 h-6 text-yellow-600`} />}
                {statusCampanha.status === 'finalizada' && <CheckCircle className={`w-6 h-6 text-blue-600`} />}
                {statusCampanha.status === 'bloqueado' && <XCircle className={`w-6 h-6 text-red-600`} />}
                {statusCampanha.status === 'pendente' && <Clock className={`w-6 h-6 text-gray-600`} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{statusCampanha.texto}</h2>
                <p className="text-sm text-gray-500">
                  {cliente?.horario_inicio && cliente?.horario_fim 
                    ? `Horário: ${cliente.horario_inicio} às ${cliente.horario_fim}`
                    : 'Horário não configurado'
                  }
                  {cliente?.dias_semana && ` • ${cliente.dias_semana}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMostrarConfig(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Settings className="w-4 h-4" />
                Configurar
              </button>
              {statusCampanha.status !== 'bloqueado' && statusCampanha.status !== 'finalizada' && (
                <button
                  onClick={handleIniciarPausar}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${
                    statusCampanha.status === 'ativo'
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {statusCampanha.status === 'ativo' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Iniciar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cards de Produtos */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Seus Produtos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
            <p className="text-sm text-gray-500 mt-1">{cliente?.canais_simultaneos || 0} canais simultâneos</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-gray-400" />
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                EM BREVE
              </span>
            </div>
            <h3 className="font-semibold text-gray-400">Disparo WhatsApp</h3>
            <p className="text-sm text-gray-400 mt-1">Em breve</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-gray-400" />
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                EM BREVE
              </span>
            </div>
            <h3 className="font-semibold text-gray-400">Disparo Email</h3>
            <p className="text-sm text-gray-400 mt-1">Em breve</p>
          </div>
        </div>

        {/* Relatórios */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Relatórios de Hoje</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Ligações</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.ligacoesHoje}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Atendidas</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.atendidas}</p>
            <p className="text-xs text-gray-400">
              {stats.ligacoesHoje > 0 ? Math.round(stats.atendidas/stats.ligacoesHoje*100) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Interessados</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.digitou1}</p>
            <p className="text-xs text-gray-400">
              {stats.ligacoesHoje > 0 ? Math.round(stats.digitou1/stats.ligacoesHoje*100) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">WhatsApp</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.whatsappEnviados}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Bloqueios</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.bloqueios}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Sem Resp.</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{stats.semResposta}</p>
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
            <input
              type="file"
              accept=".csv,.txt,.tsv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer block"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <RefreshCw className="w-10 h-10 text-blue-500 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-blue-600">Enviando...</p>
                </>
              ) : uploadStatus === 'success' ? (
                <>
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-600">Upload realizado com sucesso!</p>
                  <p className="text-xs text-gray-400 mt-1">Clique para enviar outra</p>
                </>
              ) : uploadStatus === 'error' ? (
                <>
                  <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Erro no upload. Tente novamente.</p>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Arraste um arquivo ou clique para selecionar</p>
                  <p className="text-xs text-gray-400 mt-1">Excel, CSV ou TXT</p>
                </>
              )}
            </label>
          </div>

          {/* Resumo da Campanha */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Resumo da Campanha</h3>
                <p className="text-sm text-gray-500">Configurações atuais</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Contexto URA</span>
                <span className="text-sm font-medium text-gray-800">{cliente?.contexto_ura || '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Canais Simultâneos</span>
                <span className="text-sm font-medium text-gray-800">{cliente?.canais_simultaneos || '-'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Cadência</span>
                <span className="text-sm font-medium text-gray-800">{cliente?.cadencia_segundos || '-'}s</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Configurações */}
      {mostrarConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Configurações da Campanha</h3>
              <button 
                onClick={() => setMostrarConfig(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início</label>
                  <input
                    type="time"
                    value={configTemp.horario_inicio}
                    onChange={(e) => setConfigTemp({...configTemp, horario_inicio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Fim</label>
                  <input
                    type="time"
                    value={configTemp.horario_fim}
                    onChange={(e) => setConfigTemp({...configTemp, horario_fim: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dias da Semana</label>
                <input
                  type="text"
                  value={configTemp.dias_semana}
                  onChange={(e) => setConfigTemp({...configTemp, dias_semana: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="seg,ter,qua,qui,sex"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canais Simultâneos</label>
                <input
                  type="number"
                  value={configTemp.canais_simultaneos}
                  onChange={(e) => setConfigTemp({...configTemp, canais_simultaneos: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="1"
                  max="100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarConfig(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarConfig}
                  disabled={salvandoConfig}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {salvandoConfig ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
