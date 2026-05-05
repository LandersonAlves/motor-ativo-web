'use client'

import { useState } from 'react'

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    senha: '',
    empresa: '',
    produto_servico: '',
    site: '',
    instagram: '',
    cidade: '',
    bairro: '',
    plano: 'ligacao_ura'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('https://n8n.we7tech.com.br/webhook/onboarding-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSuccess(true)
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setFormData({ ...formData, whatsapp: formatted })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 text-center max-w-lg border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Cadastro Recebido! 🚀</h2>
          <p className="text-white/80 text-lg mb-2">
            A <span className="text-cyan-400 font-semibold">Helena</span>, nossa assistente de IA, 
            vai te chamar no WhatsApp agora mesmo!
          </p>
          <p className="text-white/60">
            Fique de olho no seu celular 📱
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg className="w-12 h-12" viewBox="0 0 100 60" fill="none">
              <path d="M10 50 L25 15 L40 45 L55 10 L70 50" stroke="url(#grad1)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00D4AA"/>
                  <stop offset="100%" stopColor="#00F5C4"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-3xl font-bold">
              <span className="text-cyan-400">We7</span>
              <span className="text-purple-400"> Tech</span>
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Motor <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Ativo</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Vendas automáticas com IA. Cadastre-se e receba{' '}
            <span className="text-cyan-400 font-semibold">50 leads grátis</span> +{' '}
            <span className="text-emerald-400 font-semibold">20 ligações</span> para testar!
          </p>
        </header>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
            
            {/* Dados Pessoais */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-cyan-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center text-sm">1</span>
                Dados Pessoais
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Nome completo *</label>
                  <input
                    type="text"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">WhatsApp * <span className="text-white/40">(Helena vai te chamar)</span></label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleWhatsAppChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Senha *</label>
                  <input
                    type="password"
                    name="senha"
                    required
                    minLength={6}
                    value={formData.senha}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>
            </div>

            {/* Dados da Empresa */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-purple-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center text-sm">2</span>
                Dados da Empresa
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Nome da empresa *</label>
                    <input
                      type="text"
                      name="empresa"
                      required
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all"
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Site <span className="text-white/40">(opcional)</span></label>
                    <input
                      type="url"
                      name="site"
                      value={formData.site}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all"
                      placeholder="https://seusite.com.br"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">O que você vende? *</label>
                  <textarea
                    name="produto_servico"
                    required
                    value={formData.produto_servico}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all resize-none"
                    placeholder="Descreva seu produto ou serviço principal, preços, diferenciais..."
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Instagram <span className="text-white/40">(opcional)</span></label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all"
                    placeholder="@suaempresa"
                  />
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-emerald-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-400/20 rounded-lg flex items-center justify-center text-sm">3</span>
                Localização <span className="text-white/40 font-normal text-sm">(para buscar leads)</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Cidade *</label>
                  <input
                    type="text"
                    name="cidade"
                    required
                    value={formData.cidade}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all"
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Bairro *</label>
                  <input
                    type="text"
                    name="bairro"
                    required
                    value={formData.bairro}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all"
                    placeholder="Vila Mariana"
                  />
                </div>
              </div>
            </div>

            {/* Produto/Serviço */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-amber-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center text-sm">4</span>
                Escolha o Canal
              </h3>
              <div className="grid gap-3">
                {/* Ligação URA - Disponível */}
                <label className="relative flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-2 border-cyan-400/50 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-all group">
                  <input
                    type="radio"
                    name="plano"
                    value="ligacao_ura"
                    checked={formData.plano === 'ligacao_ura'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                    {formData.plano === 'ligacao_ura' && (
                      <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">📞 Ligação URA + WhatsApp IA</span>
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">DISPONÍVEL</span>
                    </div>
                    <p className="text-white/60 text-sm mt-1">Liga automaticamente, toca áudio, captura interesse e IA atende no WhatsApp</p>
                  </div>
                </label>

                {/* Outros - Em Breve */}
                {[
                  { id: 'sms_rcs', icon: '💬', name: 'Disparo de SMS/RCS' },
                  { id: 'whatsapp', icon: '📱', name: 'Disparo de WhatsApp' },
                  { id: 'direct', icon: '📸', name: 'Disparo de Direct Instagram' },
                  { id: 'ligacao_ia', icon: '🤖', name: 'Ligação 100% IA' },
                  { id: 'email', icon: '📧', name: 'Disparo de Email' },
                ].map((item) => (
                  <label key={item.id} className="relative flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl cursor-not-allowed opacity-50">
                    <input
                      type="radio"
                      name="plano"
                      value={item.id}
                      disabled
                      className="sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 font-semibold">{item.icon} {item.name}</span>
                        <span className="px-2 py-0.5 bg-white/20 text-white/60 text-xs font-bold rounded-full">EM BREVE</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:from-cyan-400 hover:to-emerald-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-cyan-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Criando sua conta...
                </span>
              ) : (
                'Começar Grátis 🚀'
              )}
            </button>

            {/* Info */}
            <p className="text-center text-white/40 text-sm mt-6">
              Ao se cadastrar, a <span className="text-cyan-400">Helena</span> (nossa IA) vai te chamar no WhatsApp para configurar tudo em tempo real!
            </p>
          </form>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-white font-semibold">50 Leads</div>
              <div className="text-white/50 text-sm">Grátis</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">📞</div>
              <div className="text-white font-semibold">20 Ligações</div>
              <div className="text-white/50 text-sm">Grátis</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">🤖</div>
              <div className="text-white font-semibold">IA Ilimitada</div>
              <div className="text-white/50 text-sm">No teste</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-white/30 text-sm">
          © 2026 We7 Tech - Automação com Inteligência Artificial
        </footer>
      </div>
    </div>
  )
}
