'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Profile {
  id: string
  slug: string
  full_name: string
  title: string | null
  bio: string | null
  phone: string | null
  email: string | null
  avatar_url?: string | null
  theme_color?: string | null
}

interface LinkItem {
  id: string
  title: string
  url: string
  position: number
  is_active: boolean
  emoji?: string
}

const COLOR_OPTIONS = [
  { name: 'Esmeralda Mogu', value: 'from-emerald-500 to-teal-400', hex: '#10B981', border: 'border-emerald-500' },
  { name: 'Azul Eléctrico', value: 'from-blue-500 to-indigo-500', hex: '#3B82F6', border: 'border-blue-500' },
  { name: 'Fuchsia Neón', value: 'from-pink-500 to-rose-500', hex: '#EC4899', border: 'border-pink-500' },
  { name: 'Oro Comercial', value: 'from-amber-400 to-orange-500', hex: '#F59E0B', border: 'border-amber-500' },
  { name: 'Púrpura Cyber', value: 'from-purple-500 to-violet-600', hex: '#8B5CF6', border: 'border-purple-500' },
]

const EMOJI_OPTIONS = ['🛍️', '💬', '📸', '🌐', '📍', '🍔', '☕', '🚀', '⭐', '📦', '💳', '📞']

export default function AdvancedClientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Estados para nuevo enlace
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newEmoji, setNewEmoji] = useState('🛍️')
  const [addingLink, setAddingLink] = useState(false)

  // Estados para cambio de contraseña
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        const { data: linksData } = await supabase
          .from('links')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('position', { ascending: true })

        if (linksData) setLinks(linksData)
      }
      setLoading(false)
    }

    loadData()
  }, [])

  // Guardar perfil y colores
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        title: profile.title,
        bio: profile.bio,
        phone: profile.phone,
        theme_color: profile.theme_color,
        avatar_url: profile.avatar_url,
      })
      .eq('id', profile.id)

    setSaving(false)
    if (error) {
      setMessage('❌ Error al actualizar.')
    } else {
      setMessage('✨ ¡Cambios guardados y aplicados en tiempo real!')
      setTimeout(() => setMessage(''), 3500)
    }
  }

  // Cambio de contraseña
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('❌ La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('❌ Las contraseñas no coinciden.')
      return
    }

    setUpdatingPassword(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setUpdatingPassword(false)

    if (error) {
      setPasswordMessage(`❌ Error: ${error.message}`)
    } else {
      setPasswordMessage('✨ ¡Contraseña actualizada con éxito!')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordMessage(''), 4000)
    }
  }

  // Simulación de carga de Logo/Avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && profile) {
      const previewUrl = URL.createObjectURL(file)
      setProfile({ ...profile, avatar_url: previewUrl })
    }
  }

  // AGREGAR ENLACE
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      alert('Perfil no cargado aún.')
      return
    }
    if (!newTitle.trim() || !newUrl.trim()) {
      alert('Por favor ingresa un título y una URL válida para el enlace.')
      return
    }

    setAddingLink(true)

    let formattedUrl = newUrl.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    const { data, error } = await supabase
      .from('links')
      .insert([
        {
          profile_id: profile.id,
          title: newTitle.trim(),
          url: formattedUrl,
          position: links.length + 1,
          is_active: true,
          emoji: newEmoji,
        },
      ])
      .select()

    setAddingLink(false)

    if (error) {
      console.error('Error al insertar enlace:', error)
      alert(`No se pudo añadir el enlace: ${error.message}`)
    } else if (data && data.length > 0) {
      setLinks([...links, data[0]])
      setNewTitle('')
      setNewUrl('')
      setNewEmoji('🛍️')
    }
  }

  // Eliminar enlace
  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase.from('links').delete().eq('id', id)
    if (!error) {
      setLinks(links.filter((l) => l.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
      </div>
    )
  }

  const activeTheme = COLOR_OPTIONS.find((c) => c.value === profile?.theme_color) || COLOR_OPTIONS[0]

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-emerald-500/30 pb-20">
      
      {/* NAVBAR */}
      <header className="border-b border-neutral-800 bg-[#0A0A0C]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-black tracking-wider text-white">
            MOGU<span className="text-emerald-500">.</span> <span className="text-xs font-normal text-neutral-400 ml-2">Estudio de Personalización PyME</span>
          </Link>

          {profile && (
            <Link
              href={`/nfc/${profile.slug}`}
              target="_blank"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white rounded-xl transition flex items-center gap-2 shadow-lg"
            >
              <span>Ver mi Perfil en Vivo ↗</span>
            </Link>
          )}
        </div>
      </header>

      {/* CONTENIDO CON GRID DE EDICIÓN Y PREVISUALIZACIÓN */}
      <main className="max-w-6xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONTROLES DE EDICIÓN (7 COLUMNAS) */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl shadow-2xl">
            <h1 className="text-2xl font-black text-white mb-2">Personaliza tu Negocio 🎨</h1>
            <p className="text-xs text-neutral-400 mb-6">
              Modifica la identidad visual, colores y enlaces de tu tarjeta Mogu en tiempo real.
            </p>

            {message && (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/30 animate-pulse">
                {message}
              </div>
            )}

            {profile && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* SUBIDA DE LOGO / AVATAR */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">Logotipo / Foto de Perfil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-700 bg-neutral-950 flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🏢</span>
                      )}
                    </div>
                    <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-bold text-white rounded-xl cursor-pointer transition">
                      Subir nuevo Logo
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* SELECTOR DE COLOR DE TEMA */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">Color de Identidad (Tema Neón)</label>
                  <div className="grid grid-cols-5 gap-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setProfile({ ...profile, theme_color: color.value })}
                        className={`h-10 rounded-xl transition-all flex items-center justify-center border-2 ${
                          profile.theme_color === color.value ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* CAMPOS DE TEXTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Nombre del Negocio</label>
                    <input
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Categoría Comercial</label>
                    <input
                      type="text"
                      value={profile.title || ''}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Eslogan o Bio del Negocio</label>
                  <textarea
                    rows={2}
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Teléfono / WhatsApp de Pedidos</label>
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios Visuales'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* GESTOR DE ENLACES CON EMOJIS */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Canales y Enlaces Interactivos</h2>
            <p className="text-xs text-neutral-400 mb-6">Elige el emoji representativo para cada botón de tu negocio.</p>

            <div className="space-y-4 mb-8">
              <div className="flex gap-2">
                <select
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-base text-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  {EMOJI_OPTIONS.map((em) => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Título (ej. Menú Digital, WhatsApp)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="URL de destino (https://...)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
              />
              <button
                type="button"
                disabled={addingLink}
                onClick={handleAddLink}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center"
              >
                {addingLink ? 'Añadiendo...' : '+ Añadir Enlace Interactivo'}
              </button>
            </div>

            <div className="space-y-3">
              {links.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">No hay enlaces agregados todavía.</p>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
                    <div className="flex items-center space-x-3 overflow-hidden pr-2">
                      <span className="text-xl p-2 bg-neutral-900 rounded-xl">{link.emoji || '🔗'}</span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{link.title}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{link.url}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(link.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Borrar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECCIÓN DE CAMBIO DE CONTRASEÑA */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Seguridad de la Cuenta 🔒</h2>
            <p className="text-xs text-neutral-400 mb-6">Reemplaza tu contraseña temporal por una definitiva y segura.</p>

            {passwordMessage && (
              <div className={`mb-6 p-3.5 rounded-2xl text-xs font-bold border ${passwordMessage.startsWith('❌') ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Repite tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer border border-neutral-700"
                >
                  {updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* COLUMNA DERECHA: PREVISUALIZADOR EN VIVO ESTILO SMARTPHONE (5 COLUMNAS) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full max-w-xs bg-neutral-950 border-4 border-neutral-800 rounded-[40px] p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-900 rounded-full z-30" />

            <div className="bg-[#0A0A0C] rounded-[30px] pt-10 pb-6 px-4 min-h-[580px] flex flex-col justify-between relative overflow-hidden">
              
              <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r ${activeTheme.value} opacity-20 blur-[60px] rounded-full pointer-events-none`} />

              <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-700 overflow-hidden flex items-center justify-center shadow-lg">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🏢</span>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">{profile?.full_name || 'Tu Negocio'}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mt-0.5">{profile?.title || 'Categoría PyME'}</p>
                  <p className="text-[10px] text-neutral-400 mt-1 max-w-[200px] leading-snug">{profile?.bio || 'Descripción del negocio...'}</p>
                </div>

                <div className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${activeTheme.value} text-black font-extrabold text-[10px] uppercase tracking-wider shadow-md`}>
                  Guardar en Contactos
                </div>

                <div className="w-full space-y-2 pt-2">
                  {links.length === 0 ? (
                    <p className="text-[10px] text-neutral-500 py-4">Agrega enlaces para verlos aquí</p>
                  ) : (
                    links.map((l) => (
                      <div key={l.id} className="p-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl flex items-center justify-between text-left">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <span className="text-sm">{l.emoji || '🔗'}</span>
                          <span className="text-[10px] font-bold text-white truncate">{l.title}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500">→</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-center pt-4 border-t border-neutral-900 z-10">
                <span className="text-[9px] font-bold text-neutral-500 tracking-wider">POWERED BY MOGU</span>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  )
}